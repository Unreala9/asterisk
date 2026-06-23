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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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

export const Route = createFileRoute('/_authenticated/dashboard/phone-numbers')({
  component: PhoneNumbersPage,
})

function PhoneNumbersPage() {
  const [phoneNumbers, setPhoneNumbers] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [authHeaders, setAuthHeaders] = useState<Record<string, string> | null>(null)
  const [loading, setLoading] = useState(true)

  const [addOpen, setAddOpen] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [addForm, setAddForm] = useState({ phone_number: '', friendly_name: '', provider_id: '' })

  const [linkTarget, setLinkTarget] = useState<any | null>(null)
  const [linkAgentId, setLinkAgentId] = useState<string>('')
  const [linkLoading, setLinkLoading] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const apiUrl = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "")

  const fetchData = useCallback(async (wsId: string, headers: Record<string, string>) => {
    const [pnRes, agentRes] = await Promise.all([
      fetch(`${apiUrl}/api/v1/workspaces/${wsId}/phone-numbers`, { headers }),
      fetch(`${apiUrl}/api/v1/workspaces/${wsId}/agents`, { headers }),
    ])
    setPhoneNumbers(pnRes.ok ? await pnRes.json() : [])
    setAgents(agentRes.ok ? await agentRes.json() : [])
  }, [apiUrl])

  useEffect(() => {
    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          "ngrok-skip-browser-warning": "true",
        }
        setAuthHeaders(headers)
        const setupRes = await fetch(`${apiUrl}/api/v1/workspaces/setup`, {
          method: "POST",
          headers,
          body: JSON.stringify({ user_id: session.user.id, email: session.user.email }),
        })
        const { workspace_id } = await setupRes.json()
        setWorkspaceId(workspace_id)
        await fetchData(workspace_id, headers)
      } catch (err) {
        console.error("Failed to load phone numbers:", err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [apiUrl, fetchData])

  async function handleAdd() {
    if (!workspaceId || !authHeaders) return
    if (!addForm.phone_number.trim()) { setAddError("Phone number is required"); return }
    setAddLoading(true)
    setAddError(null)
    try {
      const res = await fetch(`${apiUrl}/api/v1/workspaces/${workspaceId}/phone-numbers`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          phone_number: addForm.phone_number.trim(),
          friendly_name: addForm.friendly_name.trim() || undefined,
          provider_id: addForm.provider_id.trim() || undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Failed to add number")
      }
      setAddOpen(false)
      setAddForm({ phone_number: '', friendly_name: '', provider_id: '' })
      await fetchData(workspaceId, authHeaders)
    } catch (err: any) {
      setAddError(err.message)
    } finally {
      setAddLoading(false)
    }
  }

  async function handleLink() {
    if (!workspaceId || !authHeaders || !linkTarget) return
    setLinkLoading(true)
    try {
      await fetch(`${apiUrl}/api/v1/workspaces/${workspaceId}/phone-numbers/${linkTarget.id}`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ agent_id: linkAgentId === 'none' ? null : linkAgentId }),
      })
      setLinkTarget(null)
      await fetchData(workspaceId, authHeaders)
    } finally {
      setLinkLoading(false)
    }
  }

  async function handleDelete() {
    if (!workspaceId || !authHeaders || !deleteTarget) return
    setDeleteLoading(true)
    try {
      await fetch(`${apiUrl}/api/v1/workspaces/${workspaceId}/phone-numbers/${deleteTarget.id}`, {
        method: "DELETE",
        headers: authHeaders,
      })
      setDeleteTarget(null)
      await fetchData(workspaceId, authHeaders)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="bg-white px-4 py-3 text-black md:px-5 md:py-4">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="space-y-3">
            <div className="font-mono text-[13px] uppercase tracking-[0.03em] text-black">
              / Infrastructure
            </div>
            <h1 className="text-[40px] font-[340] leading-[1.05] tracking-[-0.015em] md:text-[52px]">
              Phone Numbers
            </h1>
            <p className="max-w-[760px] text-[14px] font-[330] leading-[1.4] text-[#000000] opacity-70">
              Manage your telecommunications stack. Provision new local or toll-free numbers or link existing enterprise carrier trunks.
            </p>
          </div>
          <Button
            onClick={() => { setAddOpen(true); setAddError(null) }}
            className="h-9 shrink-0 rounded-full bg-[#c5b0f4] px-5 text-[13px] font-[480] text-black transition-all duration-200 hover:bg-[#c5b0f4]/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Number
          </Button>
        </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#c5b0f4]" />
          <p className="text-xs font-mono uppercase tracking-widest text-[#999999]">Loading numbers...</p>
        </div>
      ) : phoneNumbers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[#e6e6e6] bg-white p-12 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#e6e6e6] bg-[#f7f7f5] shadow-sm">
            <Phone className="h-8 w-8 text-[#999999]" strokeWidth={1.5} />
          </div>
          <h3 className="mb-3 text-[20px] font-[450] text-black">No active connections</h3>
          <p className="mb-8 max-w-[420px] text-[14px] font-[320] leading-relaxed text-[#666666]">
            Add a Telnyx number you've purchased to start routing live calls to your agents.
          </p>
          <Button
            onClick={() => { setAddOpen(true); setAddError(null) }}
            className="h-10 rounded-full bg-[#c5b0f4] px-7 text-[13px] font-[480] text-black hover:bg-[#c5b0f4]/90"
          >
            Add Number
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[20px] border border-[#e6e6e6] bg-white shadow-sm">
          <div className="divide-y divide-[#f1f1f1]">
            {phoneNumbers.map((pn) => {
              const linkedAgent = pn.agents
              return (
                <div key={pn.id} className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-[#f7f7f5]/40">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-[#e6e6e6] bg-[#f7f7f5]">
                      <Phone className="h-4 w-4 text-[#999999]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="font-mono text-[14px] font-[480] text-black">{pn.phone_number}</p>
                      <p className="text-[11px] font-[320] text-[#999999]">
                        {pn.friendly_name !== pn.phone_number ? pn.friendly_name + ' · ' : ''}
                        {pn.provider} · {pn.country_code}
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
                      pn.status === 'active'
                        ? 'bg-[#dceeb1] text-[#1ea64a]'
                        : 'bg-[#f1f1f1] text-[#999999]'
                    }`}>
                      {pn.status}
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
                          onClick={() => { setLinkTarget(pn); setLinkAgentId(pn.agent_id || 'none') }}
                        >
                          <Link2 className="h-4 w-4" />
                          Link to Agent
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="gap-2 rounded-xl text-red-500 focus:text-red-500"
                          onClick={() => setDeleteTarget(pn)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
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

      {/* Add Number Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-[450]">Add Phone Number</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-mono uppercase tracking-widest text-[#999999]">Phone Number (E.164)</Label>
              <Input
                placeholder="+12025551234"
                value={addForm.phone_number}
                onChange={(e) => setAddForm(f => ({ ...f, phone_number: e.target.value }))}
                className="h-12 rounded-2xl border-[#e6e6e6] font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-mono uppercase tracking-widest text-[#999999]">Friendly Name (optional)</Label>
              <Input
                placeholder="Main support line"
                value={addForm.friendly_name}
                onChange={(e) => setAddForm(f => ({ ...f, friendly_name: e.target.value }))}
                className="h-12 rounded-2xl border-[#e6e6e6]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-mono uppercase tracking-widest text-[#999999]">Telnyx Number ID (optional)</Label>
              <Input
                placeholder="From Telnyx dashboard"
                value={addForm.provider_id}
                onChange={(e) => setAddForm(f => ({ ...f, provider_id: e.target.value }))}
                className="h-12 rounded-2xl border-[#e6e6e6] font-mono text-sm"
              />
            </div>
            {addError && <p className="text-sm text-red-500">{addError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} className="rounded-full h-11">Cancel</Button>
            <Button
              onClick={handleAdd}
              disabled={addLoading}
              className="rounded-full h-11 bg-[#c5b0f4] text-black hover:bg-[#c5b0f4]/90"
            >
              {addLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Add Number
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link to Agent Dialog */}
      <Dialog open={!!linkTarget} onOpenChange={(o) => { if (!o) setLinkTarget(null) }}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-[450]">Link to Agent</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <p className="text-[14px] text-[#666666] font-[320]">
              Inbound calls to <span className="font-mono text-black">{linkTarget?.phone_number}</span> will be handled by the selected agent.
            </p>
            <Select value={linkAgentId} onValueChange={setLinkAgentId}>
              <SelectTrigger className="h-12 rounded-2xl border-[#e6e6e6]">
                <SelectValue placeholder="Select an agent…" />
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

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this number?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-mono">{deleteTarget?.phone_number}</span> will be removed from your workspace. This does not release it from Telnyx.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="rounded-full bg-red-500 hover:bg-red-600"
            >
              {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </div>
  )
}
