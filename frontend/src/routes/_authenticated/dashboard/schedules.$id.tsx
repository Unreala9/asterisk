import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  Activity
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/dashboard/schedules/$id")({
  component: TaskDetailPage,
});

function TaskDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authHeaders, setAuthHeaders] = useState<any>(null);

  const apiUrl = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          "ngrok-skip-browser-warning": "true",
        };
        setAuthHeaders(headers);

        // Fetch task details
        const taskRes = await fetch(`${apiUrl}/api/v1/scheduled-tasks/${id}`, { headers });
        const taskData = await taskRes.json();
        setTask(taskData);

        const logsRes = await fetch(`${apiUrl}/api/v1/scheduled-tasks/${id}/logs`, { headers });
        const logsData = logsRes.ok ? await logsRes.json() : [];
        setLogs(logsData);
      } catch (err) {
        console.error("Failed to load details:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, apiUrl]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-black/20" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4 bg-white">
        <AlertCircle className="h-12 w-12 text-red-500/20" />
        <p className="text-[15px] font-[330] text-black/40">Sequence not found or unauthorized access.</p>
        <Button variant="outline" onClick={() => navigate({ to: "/dashboard/schedules" })} className="rounded-full">
          Return to Schedules
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white px-4 py-3 text-black md:px-5 md:py-4">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* Back Button */}
        <Button 
            variant="ghost" 
            onClick={() => navigate({ to: "/dashboard/schedules" })}
            className="h-9 gap-2 rounded-full px-4 text-[13px] font-[480] hover:bg-[#f7f7f5]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Schedules
        </Button>

        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-[#e6e6e6] bg-[#f7f7f5]/50">
               <Activity className="h-6 w-6 text-black/40" />
             </div>
             <div className="space-y-0.5">
               <h1 className="text-[32px] font-[340] tracking-tight">{task.title}</h1>
               <div className="flex items-center gap-3 text-[12px] font-mono text-black/30 uppercase tracking-widest">
                  <span>ID: {task.id.slice(0, 8)}</span>
                  <span>•</span>
                  <span>{task.task_type}</span>
               </div>
             </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
           <div className="rounded-[24px] border border-[#e6e6e6] bg-[#f7f7f5]/30 p-6 space-y-4">
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-black/40">
                <Calendar className="h-3.5 w-3.5" /> Temporal State
              </div>
              <div className="space-y-3">
                 <div className="flex justify-between items-center text-[14px]">
                    <span className="font-[330] text-black/50">Status</span>
                    <span className="font-[540]">{task.status.toUpperCase()}</span>
                 </div>
                 <div className="flex justify-between items-center text-[14px]">
                    <span className="font-[330] text-black/50">Next Run</span>
                    <span className="font-mono text-[13px]">{task.next_run_at ? format(new Date(task.next_run_at), "MMM d, HH:mm") : "Never"}</span>
                 </div>
                 <div className="flex justify-between items-center text-[14px]">
                    <span className="font-[330] text-black/50">Timezone</span>
                    <span className="font-[330]">{task.timezone}</span>
                 </div>
              </div>
           </div>

           <div className="rounded-[24px] border border-[#e6e6e6] bg-[#f7f7f5]/30 p-6 space-y-4 md:col-span-2">
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-black/40">
                <Activity className="h-3.5 w-3.5" /> Payload Intelligence
              </div>
              <pre className="rounded-xl bg-black/5 p-4 font-mono text-[12px] text-black/70 overflow-x-auto">
                {JSON.stringify(task.payload, null, 2)}
              </pre>
           </div>
        </div>

        {/* Execution Logs */}
        <div className="space-y-4">
           <h2 className="text-[20px] font-[340] tracking-tight">Execution Audit Trail</h2>
           <div className="overflow-hidden rounded-[20px] border border-[#e6e6e6] bg-white shadow-lg shadow-black/5">
             <Table>
               <TableHeader className="bg-[#f7f7f5]/30">
                 <TableRow className="border-[#f1f1f1] hover:bg-transparent">
                   <TableHead className="h-12 pl-8 font-mono text-[10px] uppercase tracking-[0.16em] text-black/40">Timestamp</TableHead>
                   <TableHead className="h-12 font-mono text-[10px] uppercase tracking-[0.16em] text-black/40">Attempt</TableHead>
                   <TableHead className="h-12 font-mono text-[10px] uppercase tracking-[0.16em] text-black/40">Outcome</TableHead>
                   <TableHead className="h-12 font-mono text-[10px] uppercase tracking-[0.16em] text-black/40">Latency</TableHead>
                   <TableHead className="h-12 pr-8 font-mono text-[10px] uppercase tracking-[0.16em] text-black/40">Technical Details</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {logs.length > 0 ? (
                   logs.map((log) => (
                     <TableRow key={log.id} className="border-[#f1f1f1]">
                       <TableCell className="py-4 pl-8 text-[13px] font-[330] text-black/60">
                         {format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss")}
                       </TableCell>
                       <TableCell className="py-4 font-mono text-[13px] text-black/40">
                         #{log.attempt_number}
                       </TableCell>
                       <TableCell className="py-4">
                         {log.status === "success" ? (
                           <div className="flex items-center gap-1.5 text-[#1ea64a] text-[12px] font-[540]">
                             <CheckCircle2 className="h-3.5 w-3.5" /> SUCCESS
                           </div>
                         ) : (
                           <div className="flex items-center gap-1.5 text-red-500 text-[12px] font-[540]">
                             <XCircle className="h-3.5 w-3.5" /> FAILED
                           </div>
                         )}
                       </TableCell>
                       <TableCell className="py-4 font-mono text-[13px] text-black/40">
                         {log.duration_ms}ms
                       </TableCell>
                       <TableCell className="py-4 pr-8 text-[12px] font-[330] text-black/50 italic max-w-[300px] truncate">
                         {log.error_message || "Execution completed nominally."}
                       </TableCell>
                     </TableRow>
                   ))
                 ) : (
                   <TableRow>
                     <TableCell colSpan={5} className="h-32 text-center text-[14px] font-[330] italic text-black/30">
                       No audit records found for this sequence.
                     </TableCell>
                   </TableRow>
                 )}
               </TableBody>
             </Table>
           </div>
        </div>

      </div>
    </div>
  );
}
