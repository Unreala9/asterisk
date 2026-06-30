import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Receipt, DollarSign, AlertTriangle, TrendingUp, Info } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/billing")({
  component: BillingMonitor,
});

interface BillingReport {
  workspace_id: string;
  workspace_name: string;
  total_calls: number;
  total_duration_minutes: number;
  stt_cost_usd: number;
  tts_cost_usd: number;
  llm_cost_usd: number;
  sip_cost_usd: number;
  total_cost_usd: number;
  plan_price_usd: number;
  gross_margin_usd: number;
  margin_alert: boolean;
}

function BillingMonitor() {
  const [report, setReport] = useState<BillingReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBillingReport = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const headers = { Authorization: `Bearer ${session.access_token}` };
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

      const res = await fetch(`${apiUrl}/api/admin/billing/usage`, { headers });
      if (!res.ok) throw new Error("Failed to load billing usage reports.");
      const data = await res.json();
      setReport(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to load usage reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingReport();
  }, []);

  const totalRevenue = report.reduce((sum, r) => sum + r.plan_price_usd, 0);
  const totalCost = report.reduce((sum, r) => sum + r.total_cost_usd, 0);
  const netMargin = totalRevenue - totalCost;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-black/50">
          <Receipt className="h-3.5 w-3.5" />
          <span>Monitoring</span>
        </div>
        <h1 className="text-4xl font-[340] tracking-[-0.03em] text-black">Costs & Billing</h1>
        <p className="max-w-2xl text-[14px] font-[320] leading-relaxed text-black/60">
          Analyze computational cost distributions (Speech-to-Text, LLM tokens, text synthesis, SIP minutes) and monitor margins.
        </p>
      </div>

      {/* Global Financial Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2 rounded-[20px] border border-[#e6e6e6] bg-[#f7f7f5] p-5 shadow-sm">
          <span className="font-mono text-[11px] uppercase tracking-widest text-black/50">Est. Platform Revenue</span>
          <div className="text-[28px] font-[450] text-black leading-none">${totalRevenue.toFixed(2)}</div>
        </div>

        <div className="space-y-2 rounded-[20px] border border-[#e6e6e6] bg-[#f7f7f5] p-5 shadow-sm">
          <span className="font-mono text-[11px] uppercase tracking-widest text-black/50">Total AI & SIP Cost</span>
          <div className="text-[28px] font-[450] text-black leading-none">${totalCost.toFixed(4)}</div>
        </div>

        <div className="space-y-2 rounded-[20px] border border-[#e6e6e6] bg-[#dceeb1] p-5 shadow-sm">
          <span className="font-mono text-[11px] uppercase tracking-widest text-black/50">Net Margin</span>
          <div className="text-[28px] font-[450] text-black leading-none">${netMargin.toFixed(4)}</div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[30vh] items-center justify-center">
          <p className="font-mono text-[12px] uppercase tracking-widest text-black/40">
            Compiling cost analysis...
          </p>
        </div>
      ) : report.length === 0 ? (
        <div className="flex h-[200px] flex-col items-center justify-center rounded-[20px] border border-dashed border-[#e6e6e6] bg-white">
          <Receipt className="h-8 w-8 text-black/10 mb-2" />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/40">
            No billing metrics recorded
          </p>
        </div>
      ) : (
        <div className="rounded-[20px] border border-[#e6e6e6] bg-white p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-[#e6e6e6] text-black/40 font-mono text-[11px]">
                  <th className="py-2.5">Workspace</th>
                  <th className="py-2.5">Calls / Duration</th>
                  <th className="py-2.5">Cost Split (STT/LLM/TTS/SIP)</th>
                  <th className="py-2.5 text-center">Total Cost</th>
                  <th className="py-2.5 text-center">Plan Value</th>
                  <th className="py-2.5 text-right">Margin Status</th>
                </tr>
              </thead>
              <tbody>
                {report.map((r) => (
                  <tr key={r.workspace_id} className="border-b border-[#e6e6e6] hover:bg-[#fcfcfb]">
                    <td className="py-4">
                      <div className="font-medium text-black">{r.workspace_name}</div>
                      <div className="text-[10px] text-black/40 font-mono mt-0.5">{r.workspace_id}</div>
                    </td>
                    <td className="py-4">
                      <div className="font-mono font-medium text-black">{r.total_calls} calls</div>
                      <div className="text-[11px] text-black/40 font-mono">{r.total_duration_minutes.toFixed(2)}m</div>
                    </td>
                    <td className="py-4 font-mono text-[12px] text-black/75">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 max-w-[240px]">
                        <span>STT: <strong className="text-black">${r.stt_cost_usd.toFixed(4)}</strong></span>
                        <span>LLM: <strong className="text-black">${r.llm_cost_usd.toFixed(4)}</strong></span>
                        <span>TTS: <strong className="text-black">${r.tts_cost_usd.toFixed(4)}</strong></span>
                        <span>SIP: <strong className="text-black">${r.sip_cost_usd.toFixed(4)}</strong></span>
                      </div>
                    </td>
                    <td className="py-4 text-center font-mono font-medium text-black">
                      ${r.total_cost_usd.toFixed(4)}
                    </td>
                    <td className="py-4 text-center font-mono text-black/70">
                      ${r.plan_price_usd.toFixed(2)}
                    </td>
                    <td className="py-4 text-right">
                      {r.margin_alert ? (
                        <div className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>Low Margin (${r.gross_margin_usd.toFixed(2)})</span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                          <span>Healthy (${r.gross_margin_usd.toFixed(2)})</span>
                        </span>
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
