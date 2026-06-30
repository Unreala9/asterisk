import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { History, Download, Filter, RefreshCw, Play, Volume2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/calls")({
  component: CallHistoryManager,
});

interface CallRecord {
  id: string;
  workspace_id: string;
  workspaces?: { name: string };
  agent_id: string;
  agents?: { name: string };
  caller_phone_number: string;
  dialed_number?: string;
  direction: "inbound" | "outbound";
  status: string;
  started_at: string | null;
  ended_at: string | null;
  actual_duration: number;
  cost_cents: number;
  drop_reason: string | null;
  recording_url: string | null;
}

interface WorkspaceShort {
  id: string;
  name: string;
}

interface AgentShort {
  id: string;
  name: string;
}

function CallHistoryManager() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceShort[]>([]);
  const [agents, setAgents] = useState<AgentShort[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [workspaceId, setWorkspaceId] = useState("");
  const [agentId, setAgentId] = useState("");
  const [direction, setDirection] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchFilters = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const headers = { Authorization: `Bearer ${session.access_token}` };
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

      // Workspaces
      const wsRes = await fetch(`${apiUrl}/api/admin/workspaces`, { headers });
      if (wsRes.ok) setWorkspaces(await wsRes.json());

      // Agents
      const agentsRes = await fetch(`${apiUrl}/api/admin/agents`, { headers });
      if (agentsRes.ok) setAgents(await agentsRes.json());
    } catch (e) {}
  };

  const fetchCallLogs = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const headers = { Authorization: `Bearer ${session.access_token}` };
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

      // Build query params
      const params = new URLSearchParams();
      if (workspaceId) params.append("workspace_id", workspaceId);
      if (agentId) params.append("agent_id", agentId);
      if (direction) params.append("direction", direction);
      if (status) params.append("status", status);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      const res = await fetch(`${apiUrl}/api/admin/calls?${params.toString()}`, { headers });
      if (!res.ok) throw new Error("Failed to query call history.");
      const data = await res.json();
      setCalls(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to load calls list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
    fetchCallLogs();
  }, []);

  const handleExport = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

      // Open in a new tab or trigger file download directly
      const response = await fetch(`${apiUrl}/api/admin/calls/export`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (!response.ok) throw new Error("Export request rejected.");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "voicepilot_call_logs.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("CSV export completed successfully.");
    } catch (e: any) {
      toast.error(e.message || "Failed to download logs.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-50 text-green-700";
      case "failed":
      case "no_answer":
      case "busy":
        return "bg-red-50 text-red-700";
      case "in_progress":
        return "bg-blue-50 text-blue-700 animate-pulse";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-black/50">
            <History className="h-3.5 w-3.5" />
            <span>Audit Trail</span>
          </div>
          <h1 className="text-4xl font-[340] tracking-[-0.03em] text-black">Call Logs</h1>
          <p className="max-w-2xl text-[14px] font-[320] leading-relaxed text-black/60">
            Audit calling records across all workspaces, filter sessions, listen to call recordings, and export reports.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex h-10 items-center gap-2 rounded-[12px] border border-[#e6e6e6] bg-white px-4 text-[13px] font-medium text-black transition hover:bg-[#f7f7f5]"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter panel */}
      <div className="rounded-[20px] border border-[#e6e6e6] bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-black/40">
          <Filter className="h-3.5 w-3.5" />
          <span>Filter Logs</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-black/40">Workspace</label>
            <select
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
              className="w-full rounded-[8px] border border-[#e6e6e6] bg-[#fcfcfb] px-2.5 py-1.5 text-[12px] text-black focus:outline-none"
            >
              <option value="">All Workspaces</option>
              {workspaces.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-black/40">Linked Agent</label>
            <select
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="w-full rounded-[8px] border border-[#e6e6e6] bg-[#fcfcfb] px-2.5 py-1.5 text-[12px] text-black focus:outline-none"
            >
              <option value="">All Agents</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-black/40">Direction</label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              className="w-full rounded-[8px] border border-[#e6e6e6] bg-[#fcfcfb] px-2.5 py-1.5 text-[12px] text-black focus:outline-none"
            >
              <option value="">All Directions</option>
              <option value="inbound">Inbound</option>
              <option value="outbound">Outbound</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-black/40">Call Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-[8px] border border-[#e6e6e6] bg-[#fcfcfb] px-2.5 py-1.5 text-[12px] text-black focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="in_progress">In Progress</option>
              <option value="no_answer">No Answer</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-black/40">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-[8px] border border-[#e6e6e6] bg-[#fcfcfb] px-2.5 py-1.5 text-[12px] text-black focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-black/40">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-[8px] border border-[#e6e6e6] bg-[#fcfcfb] px-2.5 py-1.5 text-[12px] text-black focus:outline-none"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => {
              setWorkspaceId("");
              setAgentId("");
              setDirection("");
              setStatus("");
              setStartDate("");
              setEndDate("");
            }}
            className="rounded-[8px] border border-[#e6e6e6] px-3.5 py-1.5 text-[12px] font-medium text-black hover:bg-[#f7f7f5]"
          >
            Clear Filters
          </button>
          <button
            onClick={fetchCallLogs}
            className="flex items-center gap-1.5 rounded-[8px] bg-black px-3.5 py-1.5 text-[12px] font-medium text-white hover:bg-black/90"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>

      {/* Call logs list */}
      {loading ? (
        <div className="flex h-[30vh] items-center justify-center">
          <p className="font-mono text-[12px] uppercase tracking-widest text-black/40">
            Querying call databases...
          </p>
        </div>
      ) : calls.length === 0 ? (
        <div className="flex h-[200px] flex-col items-center justify-center rounded-[20px] border border-dashed border-[#e6e6e6] bg-white">
          <History className="h-8 w-8 text-black/10 mb-2" />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/40">
            No matching calls found
          </p>
        </div>
      ) : (
        <div className="rounded-[20px] border border-[#e6e6e6] bg-white p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-[#e6e6e6] text-black/40 font-mono text-[11px]">
                  <th className="py-2.5">Call ID</th>
                  <th className="py-2.5">Workspace / Agent</th>
                  <th className="py-2.5">Caller ID</th>
                  <th className="py-2.5">Duration</th>
                  <th className="py-2.5">Date & Time</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Recording</th>
                </tr>
              </thead>
              <tbody>
                {calls.map((c) => (
                  <tr key={c.id} className="border-b border-[#e6e6e6] hover:bg-[#fcfcfb]">
                    <td className="py-4">
                      <div className="font-mono font-medium text-black leading-none">{c.id.substring(0, 8)}...</div>
                      <div className="text-[10px] text-black/40 mt-1 font-mono uppercase">
                        {c.direction}
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="font-medium text-black">{c.workspaces?.name || "Workspace"}</div>
                      <div className="text-[11px] text-black/40">{c.agents?.name || "Agent"}</div>
                    </td>
                    <td className="py-4 font-mono text-black/70">{c.caller_phone_number}</td>
                    <td className="py-4 font-mono text-black/60">{c.actual_duration}s</td>
                    <td className="py-4 text-black/60">
                      {c.started_at ? new Date(c.started_at).toLocaleString() : "Pending"}
                    </td>
                    <td className="py-4">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${getStatusColor(c.status)}`}>
                        {c.status.toUpperCase()}
                      </span>
                      {c.drop_reason && (
                        <div className="text-[10px] text-red-500 font-medium mt-1 leading-tight max-w-[150px] truncate" title={c.drop_reason}>
                          {c.drop_reason}
                        </div>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      {c.recording_url ? (
                        <div className="inline-flex items-center gap-2">
                          <audio src={c.recording_url} controls className="h-8 max-w-[180px] scale-90" />
                        </div>
                      ) : (
                        <span className="text-[11px] text-black/30 italic">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
