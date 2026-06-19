import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { History, Download, Receipt } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard/billing")({
  component: BillingPage,
});

const usageData = [
  { day: "Mon", mins: 120 },
  { day: "Tue", mins: 150 },
  { day: "Wed", mins: 80 },
  { day: "Thu", mins: 210 },
  { day: "Fri", mins: 180 },
  { day: "Sat", mins: 60 },
  { day: "Sun", mins: 90 },
];

function BillingPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-3 md:px-5 md:py-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#999999]">
          <Receipt className="h-3.5 w-3.5" />
          <span>Financial Operations</span>
        </div>
        <h1 className="text-4xl font-[340] tracking-[-0.03em] text-black md:text-5xl">Billing</h1>
        <p className="text-[#666666] text-[18px] max-w-2xl font-[320] leading-relaxed">
          Manage your subscription plans, telemetry consumption, and payment methods.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 bg-white border border-[#e6e6e6] rounded-[24px] overflow-hidden flex flex-col shadow-sm">
          <div className="p-8 bg-[#c5b0f4] text-black border-b border-black/5">
            <h3 className="text-[20px] font-[480]">Telemetry Consumption</h3>
            <p className="text-[14px] text-black/60 font-[320]">Voice synthesis and processing minutes for current cycle.</p>
          </div>
          <div className="h-[300px] w-full p-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageData}>
                <defs>
                  <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c5b0f4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c5b0f4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  stroke="#999999"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#999999"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e6e6e6",
                    borderRadius: "12px",
                    fontSize: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="mins"
                  stroke="#c5b0f4"
                  fillOpacity={1}
                  fill="url(#usageGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 p-6 pt-0">
            <div className="p-6 rounded-[20px] bg-[#f7f7f5] border border-[#e6e6e6]">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#999999]">Current Accrual</span>
              <p className="text-[28px] font-[450] text-black mt-1">$0.00</p>
            </div>
            <div className="p-6 rounded-[20px] bg-[#f7f7f5] border border-[#e6e6e6]">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#999999]">Projected Total</span>
              <p className="text-[28px] font-[450] text-black mt-1">$0.00</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e6e6e6] rounded-[24px] p-8 space-y-8 shadow-sm">
          <div className="space-y-1">
            <h3 className="text-[18px] font-[480] text-black">Financial Source</h3>
            <p className="text-[13px] text-[#666666] font-[320]">Primary settlement method.</p>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-[16px] border border-[#e6e6e6] bg-[#f7f7f5]/30">
              <p className="text-[13px] text-[#999999] italic font-[320]">No payment source connected.</p>
            </div>
            <Button variant="outline" className="w-full h-11 rounded-full border-[#e6e6e6] hover:bg-[#f7f7f5] text-[13px] font-[480] text-black">
              Update Payment Method
            </Button>
            <div className="h-px w-full bg-[#f1f1f1]" />
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-[#999999] font-[320]">Active Plan</span>
                <span className="text-[13px] font-[480] text-black">Free Tier ($0/mo)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-[#999999] font-[320]">Engine Cost</span>
                <span className="text-[13px] font-[480] text-black">$0.06/min</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#e6e6e6] rounded-[24px] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-[#f1f1f1] flex items-center gap-3">
          <History className="h-5 w-5 text-black opacity-60" />
          <h3 className="text-[20px] font-[480] text-black">Ledger History</h3>
        </div>
        <div className="p-4">
          <div className="divide-y divide-[#f1f1f1]">
            <p className="text-center py-12 text-[#999999] text-[14px] font-[320] italic">No previous invoices found.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
