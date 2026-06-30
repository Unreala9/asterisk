import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Settings, ShieldAlert, Key, Lock, History, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsAndAuditManager,
});

interface AuditLog {
  id: string;
  admin_id: string;
  profiles?: { email: string };
  action: string;
  target_type: string;
  target_id: string | null;
  details: Record<string, any>;
  ip_address: string | null;
  created_at: string;
}

function SettingsAndAuditManager() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Key Form states
  const [keyName, setKeyName] = useState("OPENAI_API_KEY");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [savingKey, setSavingKey] = useState(false);

  const fetchAuditLogs = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const headers = { Authorization: `Bearer ${session.access_token}` };
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

      const res = await fetch(`${apiUrl}/api/admin/settings/audit-logs`, { headers });
      if (!res.ok) throw new Error("Failed to load audit trails.");
      const data = await res.json();
      setLogs(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to load audit logs.");
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingKey(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const headers = {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      };
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

      const body = {
        key_name: keyName,
        api_key: apiKey,
      };

      const res = await fetch(`${apiUrl}/api/admin/settings/keys`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Key storage request rejected.");
      toast.success(`Key ${keyName} saved and encrypted.`);
      setApiKey("");
      fetchAuditLogs();
    } catch (e: any) {
      toast.error(e.message || "Failed to store credentials.");
    } finally {
      setSavingKey(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-black/50">
          <Settings className="h-3.5 w-3.5" />
          <span>System Setup</span>
        </div>
        <h1 className="text-4xl font-[340] tracking-[-0.03em] text-black">Settings & Audits</h1>
        <p className="max-w-2xl text-[14px] font-[320] leading-relaxed text-black/60">
          Configure secure third-party credentials and audit historical platform adjustments made by administrators.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Encrypted Key configuration panel */}
        <div className="rounded-[20px] border border-[#e6e6e6] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-black/40 border-b border-[#e6e6e6] pb-3">
            <Lock className="h-4 w-4" />
            <span>Encrypted Rest Credentials</span>
          </div>

          <form onSubmit={handleSaveKey} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-black/50">Key Identifier</label>
              <select
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                className="w-full rounded-[10px] border border-[#e6e6e6] bg-white px-3 py-2 text-[13px] text-black focus:outline-none"
              >
                <option value="OPENAI_API_KEY">OpenAI API Key</option>
                <option value="DEEPGRAM_API_KEY">Deepgram STT/TTS Key</option>
                <option value="SARVAM_API_KEY">Sarvam Hindi TTS Key</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-black/50">Credential Value</label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  placeholder="Enter raw API key values"
                  required
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full rounded-[10px] border border-[#e6e6e6] px-3 py-2 pr-10 text-[13px] text-black focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-2.5 text-black/40 hover:text-black"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingKey || !apiKey}
              className="w-full flex h-10 items-center justify-center rounded-[10px] bg-black text-[13px] font-medium text-white transition hover:bg-black/90 disabled:opacity-50"
            >
              {savingKey ? "Encrypting..." : "Save Encrypted Value"}
            </button>
          </form>
        </div>

        {/* Audit logs timeline */}
        <div className="lg:col-span-2 rounded-[20px] border border-[#e6e6e6] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-black/40 border-b border-[#e6e6e6] pb-3">
            <History className="h-4 w-4" />
            <span>Administrative Audit Log</span>
          </div>

          {loadingLogs ? (
            <div className="flex h-[20vh] items-center justify-center">
              <p className="font-mono text-[12px] uppercase tracking-widest text-black/40">
                Fetching trails...
              </p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex h-[150px] flex-col items-center justify-center rounded-[14px] border border-dashed border-[#e6e6e6] bg-[#fcfcfb]">
              <History className="h-6 w-6 text-black/10 mb-1" />
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/40">
                No audits logged yet
              </p>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[400px]">
              <table className="w-full border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-b border-[#e6e6e6] text-black/40 font-mono text-[11px]">
                    <th className="py-2">Admin / IP</th>
                    <th className="py-2">Action</th>
                    <th className="py-2">Target Type / ID</th>
                    <th className="py-2 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-[#e6e6e6] hover:bg-[#fcfcfb] text-[12px]">
                      <td className="py-2.5">
                        <div className="font-medium text-black">{log.profiles?.email || "Super Admin"}</div>
                        <div className="text-[10px] text-black/40 font-mono">{log.ip_address || "Internal IP"}</div>
                      </td>
                      <td className="py-2.5">
                        <span className="font-semibold text-black/80">{log.action}</span>
                      </td>
                      <td className="py-2.5 text-black/60">
                        <div className="font-semibold">{log.target_type}</div>
                        <div className="text-[10px] font-mono">{log.target_id || "Global"}</div>
                      </td>
                      <td className="py-2.5 text-right font-mono text-black/55">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
