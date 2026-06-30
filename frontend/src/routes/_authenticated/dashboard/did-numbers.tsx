import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Phone, Globe, Loader2, Bot, Trash2, Link2, MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { useWorkspace } from "@/context/WorkspaceContext"

export const Route = createFileRoute('/_authenticated/dashboard/did-numbers')({
  component: DidNumbersPage,
})

export function DidNumbersPage() {
  const { workspaceId: contextWsId, authHeaders: contextHeaders, loading: contextLoading } = useWorkspace()
  const [dids, setDids] = useState<any[]>([])
  const [trunks, setTrunks] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [authHeaders, setAuthHeaders] = useState<Record<string, string> | null>(null)
  const [loading, setLoading] = useState(true)

  const [addOpen, setAddOpen] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [addForm, setAddForm] = useState({
    phone_number: '',
    country_code: 'IN',
    label: '',
    sip_trunk_provider_id: 'none',
    agent_id: 'none',
    inbound_enabled: true,
    outbound_enabled: false,
    recording_enabled: false
  })

  const [linkTarget, setLinkTarget] = useState<any | null>(null)
  const [linkAgentId, setLinkAgentId] = useState<string>('')
  const [linkLoading, setLinkLoading] = useState(false)

  const apiUrl = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "")

  const fetchData = useCallback(async (wsId: string, headers: Record<string, string>) => {
    const [didRes, trunkRes, agentRes] = await Promise.all([
      fetch(`${apiUrl}/api/v1/workspaces/${wsId}/did-numbers`, { headers }),
      fetch(`${apiUrl}/api/v1/workspaces/${wsId}/sip-trunks`, { headers }),
      fetch(`${apiUrl}/api/v1/workspaces/${wsId}/agents`, { headers }),
    ])
    setDids(didRes.ok ? await didRes.json() : [])
    setTrunks(trunkRes.ok ? await trunkRes.json() : [])
    setAgents(agentRes.ok ? await agentRes.json() : [])
  }, [apiUrl])

  useEffect(() => {
    if (contextLoading) return;
    if (!contextWsId || !contextHeaders) {
      setLoading(false);
      return;
    }

    setWorkspaceId(contextWsId);
    setAuthHeaders(contextHeaders);

    async function init() {
      try {
        await fetchData(contextWsId!, contextHeaders!);
      } catch (err) {
        console.error("Failed to load DID numbers:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [contextWsId, contextHeaders, contextLoading, fetchData]);

  async function handleAdd() {
    if (!workspaceId || !authHeaders) return
    if (!addForm.phone_number.trim()) { toast.error("Phone number is required"); return }
    setAddLoading(true)
    try {
      const payload = {
        phone_number: addForm.phone_number.trim(),
        country_code: addForm.country_code,
        label: addForm.label.trim() || null,
        sip_trunk_provider_id: addForm.sip_trunk_provider_id === 'none' ? null : addForm.sip_trunk_provider_id,
        agent_id: addForm.agent_id === 'none' ? null : addForm.agent_id,
        inbound_enabled: addForm.inbound_enabled,
        outbound_enabled: addForm.outbound_enabled,
        recording_enabled: addForm.recording_enabled
      }
      
      const res = await fetch(`${apiUrl}/api/v1/workspaces/${workspaceId}/did-numbers`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Failed to add DID number")
      }
      setAddOpen(false)
      setAddForm({
        phone_number: '',
        country_code: 'IN',
        label: '',
        sip_trunk_provider_id: 'none',
        agent_id: 'none',
        inbound_enabled: true,
        outbound_enabled: false,
        recording_enabled: false
      })
      await fetchData(workspaceId, authHeaders)
      toast.success("DID number added successfully")
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setAddLoading(false)
    }
  }

  async function handleLink() {
    if (!workspaceId || !authHeaders || !linkTarget) return
    setLinkLoading(true)
    try {
      const res = await fetch(`${apiUrl}/api/v1/workspaces/${workspaceId}/did-numbers/${linkTarget.id}`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ agent_id: linkAgentId === 'none' ? null : linkAgentId }),
      })
      if (res.ok) {
        toast.success("Agent routing updated")
        setLinkTarget(null)
        await fetchData(workspaceId, authHeaders)
      } else {
        toast.error("Failed to update agent routing")
      }
    } finally {
      setLinkLoading(false)
    }
  }

  async function toggleStatus(did: any) {
    if (!workspaceId || !authHeaders) return
    const targetStatus = did.status === 'disabled' ? 'active' : 'disabled'
    try {
      const res = await fetch(`${apiUrl}/api/v1/workspaces/${workspaceId}/did-numbers/${did.id}`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ status: targetStatus }),
      })
      if (res.ok) {
        toast.success(`DID number ${targetStatus === 'disabled' ? 'disabled' : 'enabled'}`)
        await fetchData(workspaceId, authHeaders)
      }
    } catch (e) {
      toast.error("Failed to update DID status")
    }
  }

  async function handleDelete(didId: string) {
    if (!workspaceId || !authHeaders) return
    if (!confirm("Are you sure you want to delete this DID number?")) return
    try {
      const res = await fetch(`${apiUrl}/api/v1/workspaces/${workspaceId}/did-numbers/${didId}`, {
        method: "DELETE",
        headers: authHeaders
      })
      if (res.ok) {
        toast.success("DID number deleted successfully")
        await fetchData(workspaceId, authHeaders)
      } else {
        const err = await res.json()
        toast.error(err.detail || "Failed to delete DID number")
      }
    } catch (e) {
      toast.error("Failed to delete DID number")
    }
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-3 md:px-5 md:py-4">
      <div className="space-y-8">

        {/* Header */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#999999]">
              <Phone className="h-3.5 w-3.5" />
              <span>Infrastructure</span>
            </div>
            <h1 className="text-4xl font-[340] tracking-[-0.03em] text-black md:text-5xl">
              DID Numbers
            </h1>
            <p className="max-w-2xl text-[15px] font-[330] leading-relaxed text-black/60">
              List and manage direct inward dialing (DID) numbers from your Asterisk SIP trunks. Map phone numbers to specific AI agents.
            </p>
          </div>
          <Button
            onClick={() => setAddOpen(true)}
            className="h-9 shrink-0 rounded-full bg-[#c5b0f4] px-5 text-[13px] font-[480] text-black transition-all duration-200 hover:bg-[#c5b0f4]/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add DID Number
          </Button>
        </div>

        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#c5b0f4]" />
            <p className="text-xs font-mono uppercase tracking-widest text-[#999999]">Loading DIDs...</p>
          </div>
        ) : dids.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[#e6e6e6] bg-white p-12 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#e6e6e6] bg-[#f7f7f5] shadow-sm">
              <Phone className="h-8 w-8 text-[#999999]" strokeWidth={1.5} />
            </div>
            <h3 className="mb-3 text-[20px] font-[450] text-black">No DID numbers registered</h3>
            <p className="mb-8 max-w-[420px] text-[14px] font-[320] leading-relaxed text-[#666666]">
              Add local DID phone numbers associated with your SIP trunks to map calls directly to your configured AI agents.
            </p>
            <Button
              onClick={() => setAddOpen(true)}
              className="h-10 rounded-full bg-[#c5b0f4] px-7 text-[13px] font-[480] text-black hover:bg-[#c5b0f4]/90"
            >
              Add DID Number
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[20px] border border-[#e6e6e6] bg-white shadow-sm">
            <div className="divide-y divide-[#f1f1f1]">
              {dids.map((did) => {
                const linkedAgent = did.agents
                const linkedTrunk = did.sip_trunk_providers
                return (
                  <div key={did.id} className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-[#f7f7f5]/40">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-[#e6e6e6] bg-[#f7f7f5]">
                        <Globe className="h-4 w-4 text-[#999999]" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="font-mono text-[14px] font-[480] text-black">{did.phone_number}</p>
                        <p className="text-[11px] font-[320] text-[#999999]">
                          {did.label ? did.label + ' · ' : ''}
                          Trunk: {linkedTrunk?.name || 'None'} · Country: {did.country_code}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {linkedAgent ? (
                        <div className="flex items-center gap-2 rounded-full border border-[#c5b0f4]/20 bg-[#c5b0f4]/10 px-3 py-1">
                          <Bot className="h-3.5 w-3.5 text-[#c5b0f4]" />
                          <span className="text-[11px] font-[480] text-[#c5b0f4]">{linkedAgent.name}</span>
                        </div>
                      ) : (
                        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#cccccc]">Unlinked</span>
                      )}

                      <span className={`rounded-full px-3 py-1 text-[9px] font-mono uppercase tracking-[0.16em] ${
                        did.status === 'active'
                          ? 'bg-[#dceeb1] text-[#1ea64a]'
                          : 'bg-[#f1f1f1] text-[#999999]'
                      }`}>
                        {did.status}
                      </span>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-[#f7f7f5]">
                            <MoreVertical className="h-4 w-4 text-[#999999]" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl">
                          <DropdownMenuItem
                            className="gap-2 rounded-xl"
                            onClick={() => { setLinkTarget(did); setLinkAgentId(did.agent_id || 'none') }}
                          >
                            <Link2 className="h-4 w-4" />
                            Link to Agent
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 rounded-xl"
                            onClick={() => toggleStatus(did)}
                          >
                            <Phone className="h-4 w-4" />
                            {did.status === 'active' ? 'Disable' : 'Enable'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="gap-2 rounded-xl text-red-500 focus:text-red-600 focus:bg-red-50"
                            onClick={() => handleDelete(did.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Add DID Dialog */}
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent className="rounded-3xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-[450] tracking-tight">Add DID Number</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-mono uppercase tracking-widest text-[#999999]">Phone Number (E.164)</Label>
                <Input
                  placeholder="+911140001000"
                  value={addForm.phone_number}
                  onChange={(e) => setAddForm(f => ({ ...f, phone_number: e.target.value }))}
                  className="h-12 rounded-2xl border-[#e6e6e6] font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-mono uppercase tracking-widest text-[#999999]">Friendly Label</Label>
                <Input
                  placeholder="Main trunk DID line"
                  value={addForm.label}
                  onChange={(e) => setAddForm(f => ({ ...f, label: e.target.value }))}
                  className="h-12 rounded-2xl border-[#e6e6e6]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-mono uppercase tracking-widest text-[#999999]">Country Code</Label>
                  <Input
                    placeholder="IN"
                    value={addForm.country_code}
                    onChange={(e) => setAddForm(f => ({ ...f, country_code: e.target.value.toUpperCase() }))}
                    className="h-12 rounded-2xl border-[#e6e6e6] font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-mono uppercase tracking-widest text-[#999999]">SIP Trunk</Label>
                  <Select
                    value={addForm.sip_trunk_provider_id}
                    onValueChange={(val) => setAddForm(f => ({ ...f, sip_trunk_provider_id: val }))}
                  >
                    <SelectTrigger className="h-12 rounded-2xl border-[#e6e6e6]">
                      <SelectValue placeholder="Select trunk..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="none">— No trunk —</SelectItem>
                      {trunks.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-mono uppercase tracking-widest text-[#999999]">Inbound AI Agent</Label>
                <Select
                  value={addForm.agent_id}
                  onValueChange={(val) => setAddForm(f => ({ ...f, agent_id: val }))}
                >
                  <SelectTrigger className="h-12 rounded-2xl border-[#e6e6e6]">
                    <SelectValue placeholder="Select agent..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="none">— Unlinked (no routing) —</SelectItem>
                    {agents.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)} className="rounded-full h-11">Cancel</Button>
              <Button
                onClick={handleAdd}
                disabled={addLoading}
                className="rounded-full h-11 bg-[#c5b0f4] text-black hover:bg-[#c5b0f4]/90"
              >
                {addLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Add DID Number
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Link to Agent Dialog */}
        <Dialog open={!!linkTarget} onOpenChange={(o) => { if (!o) setLinkTarget(null) }}>
          <DialogContent className="rounded-3xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-[450] tracking-tight">Link to Agent</DialogTitle>
            </DialogHeader>
            <div className="py-2 space-y-4">
              <p className="text-[14px] text-[#666666] font-[320]">
                Calls to DID <span className="font-mono text-black">{linkTarget?.phone_number}</span> will be handled by the selected agent.
              </p>
              <Select value={linkAgentId} onValueChange={setLinkAgentId}>
                <SelectTrigger className="h-12 rounded-2xl border-[#e6e6e6]">
                  <SelectValue placeholder="Select agent..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="none">— No agent (unlink) —</SelectItem>
                  {agents.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setLinkTarget(null)} className="rounded-full h-11">Cancel</Button>
              <Button
                onClick={handleLink}
                disabled={linkLoading}
                className="rounded-full h-11 bg-[#c5b0f4] text-black hover:bg-[#c5b0f4]/90"
              >
                {linkLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}
