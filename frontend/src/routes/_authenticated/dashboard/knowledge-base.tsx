import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Book, Save, Loader2, Bot, FlaskConical, Plus, FileText, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute(
  "/_authenticated/dashboard/knowledge-base",
)({
  component: KnowledgeBasePage,
});

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000"
).replace(/\/$/, "");

function KnowledgeBasePage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("Loading agents...");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [authHeaders, setAuthHeaders] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    void init();
  }, []);

  useEffect(() => {
    if (!selectedAgentId || agents.length === 0) return;
    const agent = agents.find((a) => a.id === selectedAgentId);
    setContent(agent?.knowledge_base || "");
    setSaved(false);
    setSaveError(null);
  }, [selectedAgentId]);

  async function init() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setStatus("Not authenticated."); return; }

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
        "ngrok-skip-browser-warning": "true",
      };
      setAuthHeaders(headers);

      const setupRes = await fetch(`${API_URL}/api/v1/workspaces/setup`, {
        method: "POST",
        headers,
        body: JSON.stringify({ user_id: session.user.id, email: session.user.email }),
      });
      if (!setupRes.ok) throw new Error("Workspace setup failed");
      const { workspace_id } = await setupRes.json();
      setWorkspaceId(workspace_id);

      const agentsRes = await fetch(`${API_URL}/api/v1/workspaces/${workspace_id}/agents`, { headers });
      if (!agentsRes.ok) throw new Error("Failed to fetch agents");
      const data = await agentsRes.json();
      setAgents(data);
      setStatus(data.length === 0 ? "No agents found. Create one first." : "");
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  async function saveKnowledgeBase() {
    if (!workspaceId || !authHeaders || !selectedAgentId) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(
        `${API_URL}/api/v1/workspaces/${workspaceId}/agents/${selectedAgentId}`,
        {
          method: "PATCH",
          headers: authHeaders,
          body: JSON.stringify({ knowledge_base: content }),
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `HTTP ${res.status}`);
      }
      setAgents((prev) =>
        prev.map((a) => a.id === selectedAgentId ? { ...a, knowledge_base: content } : a)
      );
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsSaving(false);
    }
  }

  function handleCardClick(agentId: string) {
    if (selectedAgentId === agentId) {
      setSelectedAgentId("");
    } else {
      setSelectedAgentId(agentId);
    }
  }

  const selectedAgent = agents.find((a) => a.id === selectedAgentId);

  return (
    <div className="bg-white px-4 py-3 text-black md:px-5 md:py-4">
      <div className="mx-auto max-w-7xl space-y-12">
        
        {/* Header */}
        <div className="space-y-4">
          <div className="font-mono text-[13px] uppercase tracking-[0.03em] text-black">
            / Information Architecture
          </div>
          <h1 className="text-[40px] font-[340] leading-[1.05] tracking-[-0.015em] md:text-[52px]">
            Knowledge Base
          </h1>
          <p className="max-w-2xl text-[15px] font-[330] leading-[1.45] text-[#000000] opacity-70">
            Configure the neural context for each persona. Select an agent to update its specific behavioral parameters and data sets.
          </p>
        </div>

        {/* Agent Grid */}
        {agents.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => {
              const isSelected = selectedAgentId === agent.id;
              const kbLength = agent.knowledge_base?.length || 0;
              return (
                <button
                  key={agent.id}
                  onClick={() => handleCardClick(agent.id)}
                  className={`group rounded-[20px] border p-6 text-left transition-all duration-300
                    ${isSelected ? "border-black bg-[#f7f7f5]" : "border-[#e6e6e6] bg-white hover:border-black/40"}`}
                >
                  <div className="mb-6 flex items-start justify-between">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-[12px] border transition-all
                      ${isSelected ? "bg-black border-black text-white" : "bg-[#f7f7f5] border-[#e6e6e6] text-black"}`}
                    >
                      <Bot className="h-5 w-5" />
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-black/20 transition-transform duration-300 ${isSelected ? "rotate-180 text-black" : ""}`}
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="mb-2 text-[20px] font-[700] tracking-tight">{agent.name}</h3>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="h-6 rounded-full border-[#e6e6e6] px-3 font-mono text-[10px] uppercase tracking-widest text-black/50">
                          {agent.language}
                        </Badge>
                        <div className={`h-2 w-2 rounded-full ${agent.status === "active" ? "bg-[#1ea64a]" : "bg-red-500"}`} />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 border-t border-black/5 py-3">
                      <FileText className="h-4 w-4 text-black/30" />
                      <span className="font-mono text-[12px] uppercase tracking-wider text-black/40">
                        {kbLength > 0 ? `${kbLength.toLocaleString()} characters` : "Empty Store"}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Empty State / Create Card */}
            <Link
              to="/dashboard/agents/new"
               className="group flex min-h-[220px] flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-[#e6e6e6] p-6 text-center transition-all duration-300 hover:border-black hover:bg-[#f7f7f5]"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[#e6e6e6] transition-all group-hover:border-black group-hover:bg-black">
                <Plus className="h-7 w-7 text-black transition-all group-hover:text-white" />
              </div>
              <h4 className="mb-2 text-[20px] font-[700] text-black">New Agent</h4>
              <p className="max-w-[200px] text-[14px] font-[330] text-[#000000] opacity-50">Add a new persona to your fleet.</p>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-6 rounded-[20px] border border-[#e6e6e6] bg-white p-12 text-center">
            <Bot className="h-12 w-12 text-black/10" />
            <p className="text-[15px] font-[330] text-black/50">{status}</p>
            <Button asChild className="h-10 rounded-full bg-black px-7 text-[14px] font-[480] text-white transition-all hover:bg-black/90">
              <Link to="/dashboard/agents/new">
                <Plus className="h-5 w-5 mr-3" />
                Create First Agent
              </Link>
            </Button>
          </div>
        )}

        {/* Editor — opens below selected card */}
        {selectedAgentId && (
          <div className="pt-12">
            {saved ? (
              <div className="border border-[#e6e6e6] rounded-[32px] p-24 bg-white flex flex-col items-center justify-center gap-12 text-center">
                <div className="h-20 w-20 rounded-full bg-[#c8e6cd]/20 flex items-center justify-center">
                  <Save className="h-10 w-10 text-[#1ea64a]" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-[48px] font-[340] tracking-tight">Success</h3>
                  <p className="text-[20px] font-[330] text-black/60">
                    {selectedAgent?.name}'s neural context has been synchronized.
                  </p>
                </div>
                <div className="flex gap-6">
                  <Button
                    variant="ghost"
                    className="h-14 rounded-full border border-[#e6e6e6] px-10 text-[18px] font-[480] hover:bg-[#f7f7f5]"
                    onClick={() => { setSaved(false); setSaveError(null); }}
                  >
                    Edit Again
                  </Button>
                  <Button
                    asChild
                    className="h-14 rounded-full bg-black text-white px-10 text-[18px] font-[480] hover:bg-black/90"
                  >
                    <Link to="/dashboard/qa" search={{ agentId: selectedAgentId }}>
                      <FlaskConical className="h-5 w-5 mr-3" />
                      Test This Agent
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border border-[#e6e6e6] rounded-[32px] overflow-hidden bg-white shadow-2xl shadow-black/5">
                <div className="p-12 border-b border-[#f1f1f1] flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-[32px] font-[340] tracking-tight">
                      {selectedAgent?.name} Context
                    </h3>
                    <p className="font-mono text-[12px] uppercase tracking-widest text-black/40">
                      {content.length.toLocaleString()} characters stored
                    </p>
                  </div>
                  {saveError && (
                    <span className="text-[14px] font-[480] text-red-500 italic">Save failed: {saveError}</span>
                  )}
                </div>

                <div className="p-12">
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[600px] border-[#e6e6e6] rounded-[24px] p-12 text-[18px] leading-relaxed font-[330] focus:border-black transition-all"
                    placeholder="Paste company information, FAQs, product details, pricing, scripts — anything this agent should know..."
                  />
                </div>

                <div className="p-12 border-t border-[#f1f1f1] bg-[#f7f7f5] flex flex-col sm:flex-row items-center justify-between gap-8">
                  <Button
                    asChild
                    variant="ghost"
                    className="h-14 rounded-full border border-[#e6e6e6] px-10 text-[18px] font-[480] bg-white hover:bg-white"
                  >
                    <Link to="/dashboard/qa" search={{ agentId: selectedAgentId }}>
                      <FlaskConical className="h-5 w-5 mr-3" />
                      Test Live Session
                    </Link>
                  </Button>

                  <Button
                    className="h-16 rounded-full px-12 bg-black text-white text-[20px] font-[480] hover:bg-black/90 shadow-xl shadow-black/10 transition-all"
                    disabled={isSaving}
                    onClick={saveKnowledgeBase}
                  >
                    {isSaving ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : <Save className="h-6 w-6 mr-3" />}
                    {isSaving ? "Saving..." : "Save Context"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
