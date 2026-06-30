import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PhoneCall, RefreshCw, AlertTriangle, XCircle } from "lucide-react";
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

export const Route = createFileRoute("/_authenticated/admin/live-calls")({
  component: LiveCallMonitor,
});

interface ActiveCallChannel {
  channel: string;
  location: string;
  state: string;
  application: string;
  duration_seconds: number;
  stt_status: string;
  llm_latency_ms: number;
  tts_latency_ms: number;
}

function LiveCallMonitor() {
  const [calls, setCalls] = useState<ActiveCallChannel[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Hangup confirmation states
  const [hangupOpen, setHangupOpen] = useState(false);
  const [hangupChannel, setHangupChannel] = useState("");
  const [loadingHangup, setLoadingHangup] = useState(false);

  const fetchLiveCalls = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const headers = { Authorization: `Bearer ${session.access_token}` };
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

      const res = await fetch(`${apiUrl}/api/admin/live-calls`, { headers });
      if (!res.ok) throw new Error("Failed to load active channels.");
      const data = await res.json();
      setCalls(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to load active channels.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveCalls();
    // Poll active calls every 3 seconds for near-real-time updates
    const interval = setInterval(fetchLiveCalls, 3000);
    return () => clearInterval(interval);
  }, []);

  const confirmHangup = (channel: string) => {
    setHangupChannel(channel);
    setHangupOpen(true);
  };

  const handleHangup = async () => {
    if (!hangupChannel) return;
    setLoadingHangup(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const headers = { Authorization: `Bearer ${session.access_token}` };
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

      const res = await fetch(`${apiUrl}/api/admin/live-calls/${encodeURIComponent(hangupChannel)}/hangup`, {
        method: "POST",
        headers,
      });

      if (!res.ok) throw new Error("Failed to dispatch hangup signals.");
      toast.success("Hangup request dispatched to Asterisk channel.");
      setHangupOpen(false);
      fetchLiveCalls();
    } catch (e: any) {
      toast.error(e.message || "Hangup failed.");
    } finally {
      setLoadingHangup(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-black/50">
            <PhoneCall className="h-3.5 w-3.5" />
            <span>Telephony</span>
          </div>
          <h1 className="text-4xl font-[340] tracking-[-0.03em] text-black flex items-center gap-3">
            <span>Live call tracking</span>
            {calls.length > 0 && (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1ea64a] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#1ea64a]" />
              </span>
            )}
          </h1>
          <p className="max-w-2xl text-[14px] font-[320] leading-relaxed text-black/60">
            Monitor and manage ongoing conversations, analyze pipeline latency in real time, and terminate channels.
          </p>
        </div>
        <button
          onClick={fetchLiveCalls}
          className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#e6e6e6] bg-white transition hover:bg-[#f7f7f5]"
        >
          <RefreshCw className="h-4 w-4 text-black/60" />
        </button>
      </div>

      {/* Grid Status */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2 rounded-[20px] border border-[#e6e6e6] bg-[#f7f7f5] p-5 shadow-sm">
          <span className="font-mono text-[11px] uppercase tracking-widest text-black/50">Active Calls</span>
          <div className="text-[28px] font-[450] text-black">{calls.length}</div>
        </div>

        <div className="space-y-2 rounded-[20px] border border-[#e6e6e6] bg-[#f7f7f5] p-5 shadow-sm">
          <span className="font-mono text-[11px] uppercase tracking-widest text-black/50">Average LLM Latency</span>
          <div className="text-[28px] font-[450] text-black">
            {calls.length > 0 ? `${Math.round(calls.reduce((sum, c) => sum + c.llm_latency_ms, 0) / calls.length)}ms` : "0ms"}
          </div>
        </div>

        <div className="space-y-2 rounded-[20px] border border-[#e6e6e6] bg-[#f7f7f5] p-5 shadow-sm">
          <span className="font-mono text-[11px] uppercase tracking-widest text-black/50">Average TTS Latency</span>
          <div className="text-[28px] font-[450] text-black">
            {calls.length > 0 ? `${Math.round(calls.reduce((sum, c) => sum + c.tts_latency_ms, 0) / calls.length)}ms` : "0ms"}
          </div>
        </div>
      </div>

      {/* Channels list */}
      {loading ? (
        <div className="flex h-[30vh] items-center justify-center">
          <p className="font-mono text-[12px] uppercase tracking-widest text-black/40">
            Querying Asterisk channels...
          </p>
        </div>
      ) : calls.length === 0 ? (
        <div className="flex h-[200px] flex-col items-center justify-center rounded-[20px] border border-dashed border-[#e6e6e6] bg-white">
          <PhoneCall className="h-8 w-8 text-black/10 mb-2" />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/40">
            No live conversations streaming
          </p>
        </div>
      ) : (
        <div className="rounded-[20px] border border-[#e6e6e6] bg-white p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-[#e6e6e6] text-black/40 font-mono text-[11px]">
                  <th className="py-2.5">Active Channel ID</th>
                  <th className="py-2.5">Location / Context</th>
                  <th className="py-2.5 font-mono text-center">LLM Latency</th>
                  <th className="py-2.5 font-mono text-center">TTS Latency</th>
                  <th className="py-2.5 text-center">State</th>
                  <th className="py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {calls.map((c, idx) => (
                  <tr key={idx} className="border-b border-[#e6e6e6] hover:bg-[#fcfcfb]">
                    <td className="py-4 font-mono font-medium text-black">{c.channel}</td>
                    <td className="py-4 text-black/70">
                      <div>{c.location}</div>
                      <div className="text-[11px] text-black/40 font-mono mt-0.5">{c.application}</div>
                    </td>
                    <td className="py-4 text-center font-mono text-black/60">{c.llm_latency_ms}ms</td>
                    <td className="py-4 text-center font-mono text-black/60">{c.tts_latency_ms}ms</td>
                    <td className="py-4 text-center">
                      <span className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                        {c.state.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => confirmHangup(c.channel)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-red-200 bg-red-50 px-3 text-[11px] font-semibold text-red-600 hover:bg-red-100"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Hang Up</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Hangup Confirmation Dialog */}
      <AlertDialog open={hangupOpen} onOpenChange={setHangupOpen}>
        <AlertDialogContent className="rounded-[20px] border border-[#e6e6e6] bg-white p-6 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-[480] text-black flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Confirm Active Call Termination</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-black/60 font-[320] leading-relaxed">
              Are you sure you want to hang up the channel <strong className="text-black font-mono">{hangupChannel}</strong>? 
              This will immediately drop the active telephony call.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="rounded-[10px] border border-[#e6e6e6] text-[13px] font-medium hover:bg-[#f7f7f5]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleHangup}
              disabled={loadingHangup}
              className="rounded-[10px] bg-red-600 text-[13px] font-medium text-white hover:bg-red-700"
            >
              Terminate Call
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
