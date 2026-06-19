import { createFileRoute } from "@tanstack/react-router";
import {
  PhoneCall,
  Clock,
  Users,
  LayoutDashboard,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-3 md:px-5 md:py-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-black/50">
          <LayoutDashboard className="h-3.5 w-3.5" />
          <span>System Overview</span>
        </div>
        <h1 className="text-4xl font-[340] tracking-[-0.03em] text-black md:text-5xl">Performance</h1>
        <p className="max-w-2xl text-[15px] font-[320] leading-relaxed text-black/60">
          Real-time metrics for your autonomous voice operations and agent health.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3 rounded-[20px] border border-[#e6e6e6] bg-[#f7f7f5] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-widest text-black/50">Total Calls</span>
            <PhoneCall className="h-4 w-4 text-black opacity-20" />
          </div>
          <div>
            <div className="text-[28px] font-[450] text-black">0</div>
            <p className="text-[11px] text-black/50 mt-1 font-mono uppercase tracking-tight">
              0% vs last month
            </p>
          </div>
        </div>
        
        <div className="space-y-3 rounded-[20px] border border-[#e6e6e6] bg-[#f7f7f5] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-widest text-black/50">Avg Duration</span>
            <Clock className="h-4 w-4 text-black opacity-20" />
          </div>
          <div>
            <div className="text-[28px] font-[450] text-black">0s</div>
            <p className="text-[11px] text-black/50 mt-1 font-mono uppercase tracking-tight">
              stable baseline
            </p>
          </div>
        </div>

        <div className="space-y-3 rounded-[20px] border border-[#e6e6e6] bg-[#f7f7f5] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-widest text-black/50">Active Agents</span>
            <Users className="h-4 w-4 text-black opacity-20" />
          </div>
          <div>
            <div className="text-[28px] font-[450] text-black">0</div>
            <p className="text-[11px] text-black/50 mt-1 font-mono uppercase tracking-tight">
              none deployed
            </p>
          </div>
        </div>

        <div className="space-y-3 rounded-[20px] border border-[#e6e6e6] bg-[#f7f7f5] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-widest text-black/50">Success Rate</span>
            <div className="h-4 w-4 text-black opacity-20 flex items-center justify-center font-mono text-[10px]">%</div>
          </div>
          <div>
            <div className="text-[28px] font-[450] text-black">0%</div>
            <p className="text-[11px] text-black/50 mt-1 font-mono uppercase tracking-tight">
              pending metrics
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <div className="space-y-5 rounded-[20px] border border-[#e6e6e6] bg-white p-6 shadow-sm lg:col-span-4">
          <div className="space-y-1">
            <h3 className="text-[18px] font-[480] tracking-tight text-black">Activity Log</h3>
            <p className="text-[13px] font-[320] text-black/60">
              Interaction volume over the current billing cycle.
            </p>
          </div>
          <div className="flex h-[240px] w-full items-center justify-center rounded-[14px] border border-dashed border-[#e6e6e6] bg-[#f7f7f5]">
            <div className="flex flex-col items-center gap-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/50">No telemetry found</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-3">
          <div className="flex-1 space-y-5 rounded-[20px] border border-[#e6e6e6] bg-[#dceeb1] p-6">
            <div className="space-y-1">
              <h3 className="text-[20px] font-[480] text-black tracking-tight">Queue Status</h3>
              <p className="text-[14px] text-black/60 font-[320]">
                Recent events processed by the intelligence engine.
              </p>
            </div>
            <div className="flex flex-col items-center justify-center py-8 text-center">
               <PhoneCall className="mb-3 h-8 w-8 text-black/20" />
              <p className="text-[13px] text-black/40 font-[320] italic">Awaiting live connections...</p>
            </div>
          </div>
          
           <div className="space-y-3 rounded-[20px] border border-[#e6e6e6] bg-[#c5b0f4] p-6">
             <div className="flex items-center justify-between">
                <h3 className="text-[18px] font-[480] text-black tracking-tight">System Health</h3>
                <div className="h-2 w-2 rounded-full bg-[#1ea64a] animate-pulse" />
             </div>
             <p className="text-[13px] text-black/60 font-[320]">
                All systems operational across clusters.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

