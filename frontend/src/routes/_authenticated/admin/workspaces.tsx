import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Building2, Edit2, ShieldAlert, CheckCircle, AlertTriangle } from "lucide-react";
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

export const Route = createFileRoute("/_authenticated/admin/workspaces")({
  component: WorkspaceManager,
});

interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  owner_email: string | null;
  monthly_minute_limit: number;
  max_concurrent_calls: number;
  inbound_enabled: boolean;
  outbound_enabled: boolean;
  billing_status: "trial" | "active" | "overdue" | "suspended";
  created_at: string;
}

function WorkspaceManager() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Form states
  const [minuteLimit, setMinuteLimit] = useState(1000);
  const [concurrentLimit, setConcurrentLimit] = useState(5);
  const [inbound, setInbound] = useState(true);
  const [outbound, setOutbound] = useState(true);
  const [status, setStatus] = useState<"trial" | "active" | "overdue" | "suspended">("active");

  const fetchWorkspaces = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const headers = { Authorization: `Bearer ${session.access_token}` };
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

      const res = await fetch(`${apiUrl}/api/admin/workspaces`, { headers });
      if (!res.ok) throw new Error("Failed to load workspaces.");
      const data = await res.json();
      setWorkspaces(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to load workspaces.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const openEdit = (ws: Workspace) => {
    setSelectedWorkspace(ws);
    setMinuteLimit(ws.monthly_minute_limit);
    setConcurrentLimit(ws.max_concurrent_calls);
    setInbound(ws.inbound_enabled);
    setOutbound(ws.outbound_enabled);
    setStatus(ws.billing_status);
    setEditModalOpen(true);
  };

  const handlePreSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "suspended" && selectedWorkspace?.billing_status !== "suspended") {
      // Show warning modal before suspending
      setConfirmOpen(true);
    } else {
      saveWorkspaceLimits();
    }
  };

  const saveWorkspaceLimits = async () => {
    if (!selectedWorkspace) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const headers = {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      };
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

      const body = {
        monthly_minute_limit: minuteLimit,
        max_concurrent_calls: concurrentLimit,
        inbound_enabled: inbound,
        outbound_enabled: outbound,
        billing_status: status,
      };

      const res = await fetch(`${apiUrl}/api/admin/workspaces/${selectedWorkspace.id}/limits`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save changes.");
      toast.success("Workspace limits updated.");
      setEditModalOpen(false);
      setConfirmOpen(false);
      fetchWorkspaces();
    } catch (e: any) {
      toast.error(e.message || "Failed to save workspace updates.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">Active</span>;
      case "trial":
        return <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">Trial</span>;
      case "overdue":
        return <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">Overdue</span>;
      case "suspended":
        return <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">Suspended</span>;
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-black/50">
          <Building2 className="h-3.5 w-3.5" />
          <span>Management</span>
        </div>
        <h1 className="text-4xl font-[340] tracking-[-0.03em] text-black">Workspace Management</h1>
        <p className="max-w-2xl text-[14px] font-[320] leading-relaxed text-black/60">
          Manage tenants, edit operational limits, toggle inbound/outbound rules, and suspend delinquent accounts.
        </p>
      </div>

      {loading ? (
        <div className="flex h-[30vh] items-center justify-center">
          <p className="font-mono text-[12px] uppercase tracking-widest text-black/50">
            Retrieving tenant metadata...
          </p>
        </div>
      ) : (
        <div className="rounded-[20px] border border-[#e6e6e6] bg-white p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-[#e6e6e6] text-black/40 font-mono text-[11px]">
                  <th className="py-2.5">Workspace Name</th>
                  <th className="py-2.5">Owner Email</th>
                  <th className="py-2.5 text-center">Monthly Limit</th>
                  <th className="py-2.5 text-center">Max Concurrency</th>
                  <th className="py-2.5 text-center">Status</th>
                  <th className="py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {workspaces.map((ws) => (
                  <tr key={ws.id} className="border-b border-[#e6e6e6] hover:bg-[#fcfcfb]">
                    <td className="py-3.5 font-medium text-black">{ws.name}</td>
                    <td className="py-3.5 text-black/60 font-mono">{ws.owner_email || "No Email"}</td>
                    <td className="py-3.5 text-center font-mono">{ws.monthly_minute_limit}m</td>
                    <td className="py-3.5 text-center font-mono">{ws.max_concurrent_calls}</td>
                    <td className="py-3.5 text-center">{getStatusBadge(ws.billing_status)}</td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => openEdit(ws)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#e6e6e6] hover:bg-[#f7f7f5]"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-black/60" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit limits modal */}
      {editModalOpen && selectedWorkspace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div className="w-full max-w-md rounded-[20px] border border-[#e6e6e6] bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-xl font-[480] text-black mb-4">Edit Calling Limits</h2>
            <p className="text-[13px] text-black/60 mb-6 font-[320]">
              Modify limits for <strong className="text-black">{selectedWorkspace.name}</strong>.
            </p>

            <form onSubmit={handlePreSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-black/50">Monthly Minute Limit</label>
                <input
                  type="number"
                  value={minuteLimit}
                  onChange={(e) => setMinuteLimit(parseInt(e.target.value) || 0)}
                  className="w-full rounded-[10px] border border-[#e6e6e6] px-3 py-2 text-[13px] text-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-black/50">Max Concurrent Calls</label>
                <input
                  type="number"
                  value={concurrentLimit}
                  onChange={(e) => setConcurrentLimit(parseInt(e.target.value) || 0)}
                  className="w-full rounded-[10px] border border-[#e6e6e6] px-3 py-2 text-[13px] text-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-[13px] font-[320] text-black cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inbound}
                    onChange={(e) => setInbound(e.target.checked)}
                    className="rounded border-[#e6e6e6] text-black focus:ring-0"
                  />
                  <span>Inbound Calls</span>
                </label>

                <label className="flex items-center gap-2 text-[13px] font-[320] text-black cursor-pointer">
                  <input
                    type="checkbox"
                    checked={outbound}
                    onChange={(e) => setOutbound(e.target.checked)}
                    className="rounded border-[#e6e6e6] text-black focus:ring-0"
                  />
                  <span>Outbound Calls</span>
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-black/50">Billing Status</label>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="w-full rounded-[10px] border border-[#e6e6e6] bg-white px-3 py-2 text-[13px] text-black focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option value="trial">Trial</option>
                  <option value="active">Active</option>
                  <option value="overdue">Overdue</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#e6e6e6]">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="rounded-[10px] border border-[#e6e6e6] px-4 py-2 text-[13px] font-medium text-black hover:bg-[#f7f7f5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-[10px] bg-black px-4 py-2 text-[13px] font-medium text-white hover:bg-black/90"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Suspension */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="rounded-[20px] border border-[#e6e6e6] bg-white p-6 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-[480] text-black flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Confirm Workspace Suspension</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-black/60 font-[320] leading-relaxed">
              Are you absolutely sure you want to suspend <strong className="text-black">{selectedWorkspace?.name}</strong>? 
              This will immediately block all inbound and outbound calling loops for this tenant.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="rounded-[10px] border border-[#e6e6e6] text-[13px] font-medium hover:bg-[#f7f7f5]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={saveWorkspaceLimits}
              className="rounded-[10px] bg-red-600 text-[13px] font-medium text-white hover:bg-red-700"
            >
              Suspend Workspace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
