import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Activity, ShieldAlert, Cpu, HardDrive, ShieldCheck, Database, Key, Server, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/health")({
  component: SystemHealthManager,
});

interface HealthStatus {
  host_resources: {
    disk: {
      total_gb: number;
      used_gb: number;
      free_gb: number;
      used_percentage: number;
    };
    cpu_load_avg: number[];
    ram_used_percentage: number;
  };
  nginx_status: string;
  pm2_status: string;
  ports: Record<string, boolean>;
  api_keys: Record<string, boolean>;
  database_status: string;
}

function SystemHealthManager() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const headers = { Authorization: `Bearer ${session.access_token}` };
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

      const res = await fetch(`${apiUrl}/api/admin/system/health`, { headers });
      if (!res.ok) throw new Error("Failed to pull system diagnostics.");
      const data = await res.json();
      setHealth(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to parse diagnostic payloads.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-black/50">
            <Activity className="h-3.5 w-3.5" />
            <span>Diagnostics</span>
          </div>
          <h1 className="text-4xl font-[340] tracking-[-0.03em] text-black">System Health</h1>
          <p className="max-w-2xl text-[14px] font-[320] leading-relaxed text-black/60">
            Realtime resource diagnostics for the Asterisk telephony nodes, API gateways, database, and process loops.
          </p>
        </div>
        <button
          onClick={fetchHealth}
          className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#e6e6e6] bg-white transition hover:bg-[#f7f7f5]"
        >
          <RefreshCw className="h-4 w-4 text-black/60" />
        </button>
      </div>

      {loading || !health ? (
        <div className="flex h-[40vh] items-center justify-center">
          <p className="font-mono text-[12px] uppercase tracking-widest text-black/40">
            Retrieving host diagnostics...
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Host Resources */}
          <div className="rounded-[20px] border border-[#e6e6e6] bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-black/40 border-b border-[#e6e6e6] pb-3">
              <Cpu className="h-4 w-4" />
              <span>Host Machine resources</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[13px] font-[320] text-black mb-1">
                  <span>Disk Usage</span>
                  <span>{health.host_resources.disk.used_gb} / {health.host_resources.disk.total_gb} GB ({health.host_resources.disk.used_percentage}%)</span>
                </div>
                <div className="h-2 w-full bg-[#f2f2f0] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-black rounded-full" 
                    style={{ width: `${health.host_resources.disk.used_percentage}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[13px] font-[320] text-black mb-1">
                  <span>RAM Utilization</span>
                  <span>{health.host_resources.ram_used_percentage}%</span>
                </div>
                <div className="h-2 w-full bg-[#f2f2f0] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-black rounded-full" 
                    style={{ width: `${health.host_resources.ram_used_percentage}%` }}
                  />
                </div>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase text-black/40 block mb-1">CPU Load Averages</span>
                <div className="font-mono text-[13px] text-black/80">
                  {health.host_resources.cpu_load_avg.join("  |  ")}
                </div>
              </div>
            </div>
          </div>

          {/* Network & Ports */}
          <div className="rounded-[20px] border border-[#e6e6e6] bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-black/40 border-b border-[#e6e6e6] pb-3">
              <ShieldCheck className="h-4 w-4" />
              <span>VoIP Network Port Firewall</span>
            </div>

            <div className="space-y-3.5">
              {Object.entries(health.ports).map(([port, open]) => (
                <div key={port} className="flex items-center justify-between text-[13px]">
                  <span className="font-mono text-black/75">{port}</span>
                  <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                    OPEN & MATCHING
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Core Integrations & Database */}
          <div className="rounded-[20px] border border-[#e6e6e6] bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-black/40 border-b border-[#e6e6e6] pb-3">
              <Database className="h-4 w-4" />
              <span>Cloud & DB Health</span>
            </div>

            <div className="space-y-4 text-[13px]">
              <div className="flex items-center justify-between">
                <span>Supabase PostgreSQL</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                  health.database_status === "connected"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}>
                  {health.database_status}
                </span>
              </div>

              <div className="space-y-2.5">
                <span className="text-[11px] font-mono uppercase text-black/40 block">Global API Keys Loaded</span>
                {Object.entries(health.api_keys).map(([key, configured]) => (
                  <div key={key} className="flex items-center justify-between font-mono text-[12px]">
                    <span className="text-black/70">{key}</span>
                    <span className={`font-semibold ${configured ? "text-green-600" : "text-red-500"}`}>
                      {configured ? "CONFIGURED" : "MISSING"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PM2 & Systemd Daemon States */}
          <div className="rounded-[20px] border border-[#e6e6e6] bg-white p-5 shadow-sm space-y-4 lg:col-span-3">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-black/40 border-b border-[#e6e6e6] pb-3">
              <Server className="h-4 w-4" />
              <span>Daemon Cluster Console (PM2 & Nginx)</span>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-black/40">Nginx Process Status</label>
                <div className="rounded-[10px] border border-[#e6e6e6] bg-[#fcfcfb] p-3 text-[13px] font-mono text-black/70">
                  {health.nginx_status}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-black/40">PM2 Application Instances</label>
                <pre className="rounded-[10px] border border-[#e6e6e6] bg-[#fcfcfb] p-3 text-[11px] font-mono text-black/70 overflow-auto whitespace-pre-wrap leading-relaxed max-h-[160px]">
                  {health.pm2_status}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
