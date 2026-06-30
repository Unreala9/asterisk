import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Smartphone, Plus, Edit2, Trash2, CheckCircle, AlertTriangle, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/admin/did-numbers")({
  component: DIDNumberManager,
});

interface DIDNumber {
  id: string;
  workspace_id: string;
  workspaces?: { name: string };
  sip_trunk_provider_id: string | null;
  phone_number: string;
  country_code: string;
  label: string | null;
  provider: string;
  agent_id: string | null;
  agents?: { name: string };
  status: string;
  inbound_enabled: boolean;
  outbound_enabled: boolean;
  recording_enabled: boolean;
}

interface WorkspaceShort {
  id: string;
  name: string;
}

interface AgentShort {
  id: string;
  name: string;
  workspace_id: string;
}

interface SIPTrunkShort {
  id: string;
  name: string;
}

function DIDNumberManager() {
  const [dids, setDids] = useState<DIDNumber[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceShort[]>([]);
  const [agents, setAgents] = useState<AgentShort[]>([]);
  const [sipTrunks, setSipTrunks] = useState<SIPTrunkShort[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"list" | "form">("list");

  // Form states
  const [editId, setEditId] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState("");
  const [sipTrunkProviderId, setSipTrunkProviderId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [label, setLabel] = useState("");
  const [provider, setProvider] = useState("custom");
  const [agentId, setAgentId] = useState("");
  const [inbound, setInbound] = useState(true);
  const [outbound, setOutbound] = useState(false);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState("active");

  // Confirm delete
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const headers = { Authorization: `Bearer ${session.access_token}` };
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

      // DIDs
      const didsRes = await fetch(`${apiUrl}/api/admin/did-numbers`, { headers });
      if (!didsRes.ok) throw new Error("Failed to load DID numbers.");
      const didsData = await didsRes.json();
      setDids(didsData);

      // Workspaces
      const wsRes = await fetch(`${apiUrl}/api/admin/workspaces`, { headers });
      if (wsRes.ok) {
        const wsData = await wsRes.json();
        setWorkspaces(wsData);
      }

      // Agents
      const agentsRes = await fetch(`${apiUrl}/api/admin/agents`, { headers });
      if (agentsRes.ok) {
        const agentsData = await agentsRes.json();
        setAgents(agentsData);
      }

      // SIP Trunks
      const trunksRes = await fetch(`${apiUrl}/api/admin/sip-trunks`, { headers });
      if (trunksRes.ok) {
        const trunksData = await trunksRes.json();
        setSipTrunks(trunksData);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to load DID resources.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateForm = () => {
    setEditId(null);
    setWorkspaceId(workspaces[0]?.id || "");
    setSipTrunkProviderId("");
    setPhoneNumber("");
    setCountryCode("+1");
    setLabel("");
    setProvider("custom");
    setAgentId("");
    setInbound(true);
    setOutbound(false);
    setRecording(false);
    setStatus("active");
    setActiveTab("form");
  };

  const openEditForm = (did: DIDNumber) => {
    setEditId(did.id);
    setWorkspaceId(did.workspace_id);
    setSipTrunkProviderId(did.sip_trunk_provider_id || "");
    setPhoneNumber(did.phone_number);
    setCountryCode(did.country_code);
    setLabel(did.label || "");
    setProvider(did.provider || "custom");
    setAgentId(did.agent_id || "");
    setInbound(did.inbound_enabled);
    setOutbound(did.outbound_enabled);
    setRecording(did.recording_enabled);
    setStatus(did.status);
    setActiveTab("form");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const headers = {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      };
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

      const body = {
        workspace_id: workspaceId,
        sip_trunk_provider_id: sipTrunkProviderId || null,
        phone_number: phoneNumber,
        country_code: countryCode,
        label: label || null,
        provider,
        agent_id: agentId || null,
        inbound_enabled: inbound,
        outbound_enabled: outbound,
        recording_enabled: recording,
        status,
      };

      const url = editId
        ? `${apiUrl}/api/admin/did-numbers/${editId}`
        : `${apiUrl}/api/admin/did-numbers`;

      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to save phone number.");
      }

      toast.success(editId ? "Phone number updated." : "Phone number allocated.");
      setActiveTab("list");
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "Failed to configure phone number.");
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const headers = { Authorization: `Bearer ${session.access_token}` };
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

      const res = await fetch(`${apiUrl}/api/admin/did-numbers/${deleteId}`, {
        method: "DELETE",
        headers,
      });

      if (!res.ok) throw new Error("Failed to delete number.");
      toast.success("DID number deleted.");
      setDeleteOpen(false);
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "Deletion failed.");
    }
  };

  // Filter agents by currently selected workspace ID in the dropdown
  const filteredAgents = agents.filter((a) => a.workspace_id === workspaceId);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-black/50">
            <Smartphone className="h-3.5 w-3.5" />
            <span>Telephony</span>
          </div>
          <h1 className="text-4xl font-[340] tracking-[-0.03em] text-black">Phone Numbers (DIDs)</h1>
          <p className="max-w-2xl text-[14px] font-[320] leading-relaxed text-black/60">
            Allocate inbound numbers, assign caller IDs to workspaces/agents, and control recording loops.
          </p>
        </div>
        <div>
          {activeTab === "list" ? (
            <button
              onClick={openCreateForm}
              className="flex h-10 items-center gap-2 rounded-[12px] bg-black px-4 text-[13px] font-medium text-white transition hover:bg-black/90"
            >
              <Plus className="h-4 w-4" />
              <span>Allocate Number</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab("list")}
              className="flex h-10 items-center rounded-[12px] border border-[#e6e6e6] bg-white px-4 text-[13px] font-medium text-black transition hover:bg-[#f7f7f5]"
            >
              Back to List
            </button>
          )}
        </div>
      </div>

      {activeTab === "list" ? (
        loading ? (
          <div className="flex h-[30vh] items-center justify-center">
            <p className="font-mono text-[12px] uppercase tracking-widest text-black/40">
              Retrieving phone directory...
            </p>
          </div>
        ) : dids.length === 0 ? (
          <div className="flex h-[200px] flex-col items-center justify-center rounded-[20px] border border-dashed border-[#e6e6e6] bg-white">
            <Smartphone className="h-8 w-8 text-black/10 mb-2" />
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/40">
              No phone numbers configured
            </p>
          </div>
        ) : (
          <div className="rounded-[20px] border border-[#e6e6e6] bg-white p-6 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-b border-[#e6e6e6] text-black/40 font-mono text-[11px]">
                    <th className="py-2.5">Phone Number</th>
                    <th className="py-2.5">Workspace</th>
                    <th className="py-2.5">Linked Agent</th>
                    <th className="py-2.5 text-center">Inbound</th>
                    <th className="py-2.5 text-center">Outbound</th>
                    <th className="py-2.5 text-center">Recording</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dids.map((did) => (
                    <tr key={did.id} className="border-b border-[#e6e6e6] hover:bg-[#fcfcfb]">
                      <td className="py-3 font-mono font-medium text-black">
                        {did.country_code} {did.phone_number}
                        {did.label && (
                          <div className="text-[11px] text-black/40 font-sans font-normal">{did.label}</div>
                        )}
                      </td>
                      <td className="py-3 text-black/60">{did.workspaces?.name || "Unassigned"}</td>
                      <td className="py-3 text-black/70">
                        {did.agents?.name ? (
                          <span className="rounded-md bg-purple-50 px-2 py-0.5 font-medium text-purple-700">
                            {did.agents.name}
                          </span>
                        ) : (
                          <span className="text-black/30 italic">None</span>
                        )}
                      </td>
                      <td className="py-3 text-center">{did.inbound_enabled ? "✅" : "❌"}</td>
                      <td className="py-3 text-center">{did.outbound_enabled ? "✅" : "❌"}</td>
                      <td className="py-3 text-center">
                        <span className={`text-[11px] font-medium font-mono ${did.recording_enabled ? "text-amber-600" : "text-black/30"}`}>
                          {did.recording_enabled ? "RECORD" : "OFF"}
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-2">
                        <button
                          onClick={() => openEditForm(did)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#e6e6e6] hover:bg-[#f7f7f5]"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-black/60" />
                        </button>
                        <button
                          onClick={() => confirmDelete(did.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-red-100 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* Create/Edit Form */
        <div className="max-w-2xl rounded-[20px] border border-[#e6e6e6] bg-white p-6 shadow-sm mx-auto">
          <h2 className="text-xl font-[480] text-black mb-6">
            {editId ? "Configure DID Number" : "Allocate New DID"}
          </h2>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-black/50">Workspace</label>
                <select
                  value={workspaceId}
                  onChange={(e) => setWorkspaceId(e.target.value)}
                  className="w-full rounded-[10px] border border-[#e6e6e6] bg-white px-3 py-2 text-[13px] text-black focus:outline-none"
                >
                  <option value="">Choose Workspace</option>
                  {workspaces.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-black/50">SIP Trunk / Gateway</label>
                <select
                  value={sipTrunkProviderId}
                  onChange={(e) => setSipTrunkProviderId(e.target.value)}
                  className="w-full rounded-[10px] border border-[#e6e6e6] bg-white px-3 py-2 text-[13px] text-black focus:outline-none"
                >
                  <option value="">Unassigned / Routing Gateway</option>
                  {sipTrunks.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-black/50">Country Dialing Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +91 or +1"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full rounded-[10px] border border-[#e6e6e6] px-3 py-2 text-[13px] text-black focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-black/50">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9343418163"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full rounded-[10px] border border-[#e6e6e6] px-3 py-2 text-[13px] text-black focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-black/50">Label / Friendly Name</label>
                <input
                  type="text"
                  placeholder="e.g. Inbound Support"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full rounded-[10px] border border-[#e6e6e6] px-3 py-2 text-[13px] text-black focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-black/50">Linked Agent</label>
                <select
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  className="w-full rounded-[10px] border border-[#e6e6e6] bg-white px-3 py-2 text-[13px] text-black focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {filteredAgents.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-[13px] font-[320] text-black cursor-pointer">
                <input
                  type="checkbox"
                  checked={inbound}
                  onChange={(e) => setInbound(e.target.checked)}
                  className="rounded border-[#e6e6e6] text-black focus:ring-0"
                />
                <span>Enable Inbound Calls</span>
              </label>

              <label className="flex items-center gap-2 text-[13px] font-[320] text-black cursor-pointer">
                <input
                  type="checkbox"
                  checked={outbound}
                  onChange={(e) => setOutbound(e.target.checked)}
                  className="rounded border-[#e6e6e6] text-black focus:ring-0"
                />
                <span>Enable Outbound Calls</span>
              </label>

              <label className="flex items-center gap-2 text-[13px] font-[320] text-black cursor-pointer">
                <input
                  type="checkbox"
                  checked={recording}
                  onChange={(e) => setRecording(e.target.checked)}
                  className="rounded border-[#e6e6e6] text-black focus:ring-0"
                />
                <span>Enable Call Recording</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-[#e6e6e6]">
              <button
                type="button"
                onClick={() => setActiveTab("list")}
                className="rounded-[10px] border border-[#e6e6e6] px-4 py-2 text-[13px] font-medium text-black hover:bg-[#f7f7f5]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-[10px] bg-black px-4 py-2 text-[13px] font-medium text-white hover:bg-black/90"
              >
                Save Configuration
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Alert */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-[20px] border border-[#e6e6e6] bg-white p-6 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-[480] text-black flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Delete DID Assignment</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-black/60 font-[320] leading-relaxed">
              Are you completely sure you want to delete this DID phone number? 
              This will remove its mapping from the associated workspace and linked agents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="rounded-[10px] border border-[#e6e6e6] text-[13px] font-medium hover:bg-[#f7f7f5]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-[10px] bg-red-600 text-[13px] font-medium text-white hover:bg-red-700"
            >
              Delete Number
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
