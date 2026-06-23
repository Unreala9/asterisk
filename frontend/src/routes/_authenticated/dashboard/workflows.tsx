import { createFileRoute } from '@tanstack/react-router';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Workflow as WorkflowIcon,
  Plus,
  GitBranch,
  ArrowLeft,
  Share2,
  LayoutGrid,
  Loader2,
  AlertTriangle,
  PlayCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { WorkflowNode, WorkflowConnection, NodeType, Workflow, Position } from '@/components/workflow/types';
import { NodePalette } from '@/components/workflow/NodePalette';
import { WorkflowCanvas } from '@/components/workflow/WorkflowCanvas';
import { WorkflowSidebar } from '@/components/workflow/WorkflowSidebar';
import { WorkflowSimulator } from '@/components/workflow/WorkflowSimulator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute('/_authenticated/dashboard/workflows')({
  component: WorkflowsPage,
});

function WorkflowsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'library' | 'agents'>('library');
  const [assigningWorkflow, setAssigningWorkflow] = useState<any | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [authHeaders, setAuthHeaders] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeWorkflow, setActiveWorkflow] = useState<Workflow | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [activeViewTab, setActiveViewTab] = useState<'create' | 'simulation'>('create');
  const [saveStatus, setSaveStatus] = useState<string>('Changes saved');
  const [isPublishing, setIsPublishing] = useState(false);

  const apiUrl = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

  // Local storage helper functions
  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem('gap_standalone_workflows');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveToLocalStorage = (list: any[]) => {
    try {
      localStorage.setItem('gap_standalone_workflows', JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  };

  // 1. Fetch Agents and Initialize DB Session
  const fetchAgentsList = useCallback(
    async (wsId: string, headers: Record<string, string>) => {
      const res = await fetch(`${apiUrl}/api/v1/workspaces/${wsId}/agents`, {
        headers,
      });
      if (!res.ok) throw new Error(`Failed to load agents: ${res.status}`);
      return res.json();
    },
    [apiUrl],
  );

  const fetchWorkflows = useCallback(async (wsId: string) => {
    if (!supabase) {
      setWorkflows(loadFromLocalStorage());
      return;
    }
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('workspace_id', wsId);
      if (error) throw error;
      setWorkflows(data || []);
    } catch (err) {
      console.warn("Could not load workflows from database. Falling back to local storage.", err);
      setWorkflows(loadFromLocalStorage());
    }
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          "ngrok-skip-browser-warning": "true",
        };
        setAuthHeaders(headers);
        
        const setupRes = await fetch(`${apiUrl}/api/v1/workspaces/setup`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            user_id: session.user.id,
            email: session.user.email,
          }),
        });
        const { workspace_id } = await setupRes.json();
        setWorkspaceId(workspace_id);
        const data = await fetchAgentsList(workspace_id, headers);
        setAgents(data);
        await fetchWorkflows(workspace_id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load database workflows");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [apiUrl, fetchAgentsList, fetchWorkflows]);

  // 2. Select Agent and load/initialize its Visual Workflow Data
  const handleSelectAgent = (agent: any) => {
    const kbMetadata = agent.kb_metadata || {};
    const existingWorkflow = kbMetadata.workflow_data;

    let nodes: WorkflowNode[] = [];
    let connections: WorkflowConnection[] = [];

    // Check if visual workflow exists in agent metadata, otherwise seed defaults
    if (existingWorkflow && Array.isArray(existingWorkflow.nodes)) {
      nodes = existingWorkflow.nodes;
      connections = existingWorkflow.connections || [];
    } else {
      // Prepopulate default flow layout
      nodes = [
        {
          id: 'node-greeting',
          type: 'conversation',
          position: { x: 100, y: 150 },
          data: {
            title: 'Greeting Speech',
            prompt: agent.system_prompt || `Hello, thanks for calling! This is ${agent.name}. How can I assist you today?`
          }
        },
        {
          id: 'node-dob',
          type: 'conversation',
          position: { x: 380, y: 150 },
          data: {
            title: 'Request DOB',
            prompt: "Got it. To search your records, could you please specify your date of birth?"
          }
        },
        {
          id: 'node-logic',
          type: 'logic_split',
          position: { x: 660, y: 150 },
          data: {
            title: 'Validate Branch',
            conditions: [
              {
                variable: 'dob',
                operator: 'exists',
                value: 'true',
                targetNodeId: 'node-ending'
              }
            ]
          }
        },
        {
          id: 'node-ending',
          type: 'ending',
          position: { x: 950, y: 150 },
          data: {
            title: 'Hang Up Call'
          }
        }
      ];
      connections = [
        { id: 'c1', sourceId: 'node-greeting', targetId: 'node-dob' },
        { id: 'c2', sourceId: 'node-dob', targetId: 'node-logic' },
        { id: 'c3', sourceId: 'node-logic', targetId: 'node-ending', label: 'DOB specified' }
      ];
    }

    setActiveWorkflow({
      id: agent.id,
      name: agent.name,
      agentId: agent.id,
      cfId: agent.workspace_id,
      globalPrompt: agent.system_prompt || '',
      globalVoice: agent.voice_id || 'en-US-Neural2-A',
      globalLanguage: agent.language || 'en-US',
      globalModel: agent.model || 'gpt-4o-mini',
      nodes,
      connections
    });
    setActiveViewTab('create');
  };

  // 2.5 Standalone Workflows Creation & Selection & Assignment
  const handleCreateStandaloneWorkflow = async () => {
    if (!workspaceId) return;
    const newId = `wf-${Date.now()}`;
    const newWf = {
      id: newId,
      workspace_id: workspaceId,
      name: `Workflow - ${new Date().toLocaleDateString()}`,
      nodes: [
        {
          id: 'node-greeting',
          type: 'conversation' as NodeType,
          position: { x: 100, y: 150 },
          data: {
            title: 'Greeting Speech',
            prompt: 'Hello, thanks for calling! How can I assist you today?'
          }
        },
        {
          id: 'node-ending',
          type: 'ending' as NodeType,
          position: { x: 500, y: 150 },
          data: {
            title: 'Hang Up Call'
          }
        }
      ],
      connections: [
        { id: 'c1', sourceId: 'node-greeting', targetId: 'node-ending' }
      ]
    };

    // Save to memory
    setWorkflows(prev => [newWf, ...prev]);

    // Persist
    if (supabase) {
      try {
        const { error } = await supabase
          .from('workflows')
          .insert({
            id: newId,
            workspace_id: workspaceId,
            name: newWf.name,
            nodes: newWf.nodes,
            connections: newWf.connections
          });
        if (error) throw error;
      } catch (err) {
        console.warn("Could not insert standalone workflow to database. Using localStorage.", err);
        const currentList = loadFromLocalStorage();
        saveToLocalStorage([newWf, ...currentList]);
      }
    } else {
      const currentList = loadFromLocalStorage();
      saveToLocalStorage([newWf, ...currentList]);
    }

    // Immediately open in designer
    setActiveWorkflow({
      id: newWf.id,
      name: newWf.name,
      agentId: '', // Standalone workflow
      cfId: workspaceId,
      globalPrompt: '',
      globalVoice: 'en-US-Neural2-A',
      globalLanguage: 'en-US',
      globalModel: 'gpt-4o-mini',
      nodes: newWf.nodes,
      connections: newWf.connections
    });
    setActiveViewTab('create');
  };

  const handleSelectStandaloneWorkflow = (wf: any) => {
    setActiveWorkflow({
      id: wf.id,
      name: wf.name,
      agentId: '', // Standalone workflow
      cfId: workspaceId || '',
      globalPrompt: '',
      globalVoice: 'en-US-Neural2-A',
      globalLanguage: 'en-US',
      globalModel: 'gpt-4o-mini',
      nodes: wf.nodes || [],
      connections: wf.connections || []
    });
    setActiveViewTab('create');
  };

  const handleAssignWorkflow = async (agentId: string) => {
    if (!assigningWorkflow || !workspaceId || !authHeaders) return;
    setIsAssigning(true);

    try {
      const selectedAgent = agents.find(a => a.id === agentId);
      if (!selectedAgent) throw new Error("Agent not found");

      const greetingNode = assigningWorkflow.nodes.find((n: any) => n.id === 'node-greeting' || n.type === 'conversation');
      const compiledPrompt = greetingNode?.data?.prompt || assigningWorkflow.nodes[0]?.data?.prompt || selectedAgent.system_prompt || '';

      const patchPayload = {
        name: selectedAgent.name,
        voice: selectedAgent.voice_id,
        language: selectedAgent.language,
        system_prompt: compiledPrompt,
        workflow_data: {
          nodes: assigningWorkflow.nodes,
          connections: assigningWorkflow.connections
        }
      };

      const res = await fetch(
        `${apiUrl}/api/v1/workspaces/${workspaceId}/agents/${agentId}`,
        {
          method: "PATCH",
          headers: authHeaders,
          body: JSON.stringify(patchPayload)
        }
      );

      if (!res.ok) throw new Error(`Assignment failed: ${res.status}`);

      const updatedAgent = await res.json();
      setAgents(prev => prev.map(a => a.id === updatedAgent.id ? updatedAgent : a));
      
      toast.success(`🟢 Assigned workflow "${assigningWorkflow.name}" to agent "${selectedAgent.name}" successfully!`);
      setAssigningWorkflow(null);
    } catch (err) {
      toast.error(`🔴 Assignment failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDeleteWorkflow = async (wfId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!workspaceId) return;

    if (supabase) {
      try {
        const { error } = await supabase
          .from('workflows')
          .delete()
          .eq('id', wfId);
        if (error) throw error;
      } catch (err) {
        console.warn(err);
        const list = loadFromLocalStorage().filter((w: any) => w.id !== wfId);
        saveToLocalStorage(list);
      }
    } else {
      const list = loadFromLocalStorage().filter((w: any) => w.id !== wfId);
      saveToLocalStorage(list);
    }

    setWorkflows(prev => prev.filter((w: any) => w.id !== wfId));
    toast.success("Workflow deleted successfully!");
  };

  const handleDeleteAgentWorkflow = async (agentId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!workspaceId || !authHeaders) return;

    try {
      const selectedAgent = agents.find(a => a.id === agentId);
      if (!selectedAgent) return;

      const patchPayload = {
        name: selectedAgent.name,
        voice: selectedAgent.voice_id,
        language: selectedAgent.language,
        system_prompt: selectedAgent.system_prompt || '',
        workflow_data: null
      };

      const res = await fetch(
        `${apiUrl}/api/v1/workspaces/${workspaceId}/agents/${agentId}`,
        {
          method: "PATCH",
          headers: authHeaders,
          body: JSON.stringify(patchPayload)
        }
      );

      if (!res.ok) throw new Error(`Clearing flow failed: ${res.status}`);

      const updatedAgent = await res.json();
      setAgents(prev => prev.map(a => a.id === updatedAgent.id ? updatedAgent : a));
      toast.success(`🟢 Cleared visual workflow logic for agent "${selectedAgent.name}"!`);
    } catch (err) {
      toast.error(`🔴 Clearing flow failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // 3. Save Workflow and update Supabase / FastAPI state
  const handlePublish = async () => {
    if (!activeWorkflow || !workspaceId || !authHeaders) return;
    setIsPublishing(true);

    try {
      if (activeWorkflow.agentId) {
        // Find prompt from greeting node to use as agent system prompt fallback
        const greetingNode = activeWorkflow.nodes.find(n => n.id === 'node-greeting' || n.type === 'conversation');
        const compiledPrompt = activeWorkflow.globalPrompt || greetingNode?.data?.prompt || activeWorkflow.nodes[0]?.data?.prompt || '';

        const patchPayload = {
          name: activeWorkflow.name,
          voice: activeWorkflow.globalVoice,
          language: activeWorkflow.globalLanguage,
          system_prompt: compiledPrompt,
          workflow_data: {
            nodes: activeWorkflow.nodes,
            connections: activeWorkflow.connections
          }
        };

        const res = await fetch(
          `${apiUrl}/api/v1/workspaces/${workspaceId}/agents/${activeWorkflow.agentId}`,
          {
            method: "PATCH",
            headers: authHeaders,
            body: JSON.stringify(patchPayload)
          }
        );

        if (!res.ok) throw new Error(`Save failed: ${res.status}`);
        
        const updatedAgent = await res.json();
        
        // Update local state list
        setAgents(prev => prev.map(a => a.id === updatedAgent.id ? updatedAgent : a));
        
        setSaveStatus('Changes published');
        toast.success(`🟢 Published voice logic successfully for agent "${activeWorkflow.name}"!`);
      } else {
        // Standalone workflow publish logic
        if (supabase) {
          try {
            const { error } = await supabase
              .from('workflows')
              .upsert({
                id: activeWorkflow.id,
                workspace_id: workspaceId,
                name: activeWorkflow.name,
                nodes: activeWorkflow.nodes,
                connections: activeWorkflow.connections,
                updated_at: new Date().toISOString()
              });
            if (error) throw error;
          } catch (err) {
            console.warn(err);
            const list = loadFromLocalStorage().map((w: any) => w.id === activeWorkflow.id ? {
              ...w,
              name: activeWorkflow.name,
              nodes: activeWorkflow.nodes,
              connections: activeWorkflow.connections
            } : w);
            saveToLocalStorage(list);
          }
        } else {
          const list = loadFromLocalStorage().map((w: any) => w.id === activeWorkflow.id ? {
            ...w,
            name: activeWorkflow.name,
            nodes: activeWorkflow.nodes,
            connections: activeWorkflow.connections
          } : w);
          saveToLocalStorage(list);
        }

        // Update workflows list state
        setWorkflows(prev => prev.map((w: any) => w.id === activeWorkflow.id ? {
          ...w,
          name: activeWorkflow.name,
          nodes: activeWorkflow.nodes,
          connections: activeWorkflow.connections
        } : w));

        setSaveStatus('Changes published');
        toast.success(`🟢 Saved standalone workflow "${activeWorkflow.name}" successfully!`);
      }
    } catch (err) {
      toast.error(`🔴 Save failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsPublishing(false);
    }
  };

  // 4. Debounced auto-save directly to backend / db / local
  useEffect(() => {
    if (!activeWorkflow || !workspaceId) return;
    setSaveStatus('Saving changes...');

    const saveTimer = setTimeout(async () => {
      try {
        if (activeWorkflow.agentId && authHeaders) {
          const greetingNode = activeWorkflow.nodes.find(n => n.id === 'node-greeting' || n.type === 'conversation');
          const compiledPrompt = activeWorkflow.globalPrompt || greetingNode?.data?.prompt || '';

          const patchPayload = {
            name: activeWorkflow.name,
            voice: activeWorkflow.globalVoice,
            language: activeWorkflow.globalLanguage,
            system_prompt: compiledPrompt,
            workflow_data: {
              nodes: activeWorkflow.nodes,
              connections: activeWorkflow.connections
            }
          };

          await fetch(
            `${apiUrl}/api/v1/workspaces/${workspaceId}/agents/${activeWorkflow.agentId}`,
            {
              method: "PATCH",
              headers: authHeaders,
              body: JSON.stringify(patchPayload)
            }
          );
        } else {
          // Standalone workflow auto-save
          if (supabase) {
            try {
              const { error } = await supabase
                .from('workflows')
                .upsert({
                  id: activeWorkflow.id,
                  workspace_id: workspaceId,
                  name: activeWorkflow.name,
                  nodes: activeWorkflow.nodes,
                  connections: activeWorkflow.connections,
                  updated_at: new Date().toISOString()
                });
              if (error) throw error;
            } catch (err) {
              const list = loadFromLocalStorage().map((w: any) => w.id === activeWorkflow.id ? {
                ...w,
                name: activeWorkflow.name,
                nodes: activeWorkflow.nodes,
                connections: activeWorkflow.connections
              } : w);
              saveToLocalStorage(list);
            }
          } else {
            const list = loadFromLocalStorage().map((w: any) => w.id === activeWorkflow.id ? {
              ...w,
              name: activeWorkflow.name,
              nodes: activeWorkflow.nodes,
              connections: activeWorkflow.connections
            } : w);
            saveToLocalStorage(list);
          }
          // Update workflows list state
          setWorkflows(prev => prev.map((w: any) => w.id === activeWorkflow.id ? {
            ...w,
            name: activeWorkflow.name,
            nodes: activeWorkflow.nodes,
            connections: activeWorkflow.connections
          } : w));
        }
        
        setSaveStatus('Changes saved');
      } catch (err) {
        setSaveStatus('Error saving');
      }
    }, 1200);

    return () => clearTimeout(saveTimer);
  }, [activeWorkflow?.nodes, activeWorkflow?.connections, activeWorkflow?.globalPrompt, activeWorkflow?.globalVoice, activeWorkflow?.name]);

  const handleUpdateNodes = (updatedNodes: WorkflowNode[]) => {
    if (!activeWorkflow) return;
    setActiveWorkflow({
      ...activeWorkflow,
      nodes: updatedNodes
    });
  };

  const handleUpdateConnections = (updatedConnections: WorkflowConnection[]) => {
    if (!activeWorkflow) return;
    setActiveWorkflow({
      ...activeWorkflow,
      connections: updatedConnections
    });
  };

  const handleAddNode = (type: NodeType, position?: Position) => {
    if (!activeWorkflow) return;

    let defaultTitle = '';
    let defaultData = {};

    switch (type) {
      case 'conversation':
        defaultTitle = 'Voice Speech';
        defaultData = { prompt: 'Agent greeting instruction goes here...' };
        break;
      case 'subagent':
        defaultTitle = 'Invoke Subagent';
        defaultData = { subagentId: '' };
        break;
      case 'function':
        defaultTitle = 'API Webhook';
        defaultData = { apiUrl: 'https://', apiMethod: 'POST' };
        break;
      case 'call_transfer':
        defaultTitle = 'Live Hand-off';
        defaultData = { phoneNumber: '' };
        break;
      case 'press_digit':
        defaultTitle = 'Dialpad Touch Tones';
        defaultData = { digit: '1' };
        break;
      case 'logic_split':
        defaultTitle = 'Conditional Routing';
        defaultData = { conditions: [] };
        break;
      case 'agent_transfer':
        defaultTitle = 'Global Handoff';
        defaultData = { subagentId: '' };
        break;
      case 'in_call_sms':
        defaultTitle = 'Send Cellular SMS';
        defaultData = { smsMessage: 'Your confirmation code is...' };
        break;
      case 'extract_variable':
        defaultTitle = 'Parse Variable Key';
        defaultData = { variableName: 'patient_dob', variableType: 'string', prompt: '' };
        break;
      case 'code':
        defaultTitle = 'JS Sandbox Engine';
        defaultData = { codeSnippet: '// Sandbox logic...' };
        break;
      case 'mcp':
        defaultTitle = 'MCP Tool Call';
        defaultData = { mcpServer: '', mcpTool: '' };
        break;
      case 'ending':
        defaultTitle = 'Hang Up Call';
        defaultData = {};
        break;
      case 'note':
        defaultTitle = 'Sticky Note';
        defaultData = { noteText: 'Write annotations here...', noteColor: '#fef9c3' };
        break;
    }

    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type,
      position: position || { x: 250, y: 150 },
      data: {
        title: defaultTitle,
        ...defaultData
      }
    };

    let newConnections = [...activeWorkflow.connections];
    if (selectedNodeId && type !== 'note') {
      const parentNode = activeWorkflow.nodes.find(n => n.id === selectedNodeId);
      if (parentNode && parentNode.type !== 'ending') {
        const isDuplicate = newConnections.some(c => c.sourceId === selectedNodeId && c.targetId === newNode.id);
        if (!isDuplicate) {
          newConnections.push({
            id: `conn-${Date.now()}`,
            sourceId: selectedNodeId,
            targetId: newNode.id,
            label: parentNode.type === 'logic_split' ? 'Next Branch' : undefined
          });
        }
      }
    }

    setActiveWorkflow({
      ...activeWorkflow,
      nodes: [...activeWorkflow.nodes, newNode],
      connections: newConnections
    });
    
    setSelectedNodeId(newNode.id);
  };

  const handleUpdateNodeDetails = (nodeId: string, updatedData: any) => {
    if (!activeWorkflow) return;
    
    const updatedNodes = activeWorkflow.nodes.map(n =>
      n.id === nodeId ? { ...n, data: updatedData } : n
    );

    let updatedConnections = [...activeWorkflow.connections];
    const node = activeWorkflow.nodes.find(n => n.id === nodeId);
    if (node && node.type === 'logic_split') {
      const conditions = updatedData.conditions || [];
      updatedConnections = updatedConnections.map(c => {
        if (c.sourceId === nodeId) {
          const matchingCond = conditions.find((cond: any) => cond.targetNodeId === c.targetId);
          if (matchingCond) {
            return { ...c, label: `${matchingCond.variable} ${matchingCond.operator === 'equals' ? '==' : matchingCond.operator} ${matchingCond.value}` };
          }
        }
        return c;
      });
    }

    setActiveWorkflow({
      ...activeWorkflow,
      nodes: updatedNodes,
      connections: updatedConnections
    });
  };

  const handleDeleteNode = (nodeId: string) => {
    if (!activeWorkflow) return;
    
    const filteredNodes = activeWorkflow.nodes.filter(n => n.id !== nodeId);
    const filteredConnections = activeWorkflow.connections.filter(
      c => c.sourceId !== nodeId && c.targetId !== nodeId
    );

    setActiveWorkflow({
      ...activeWorkflow,
      nodes: filteredNodes,
      connections: filteredConnections
    });

    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  };

  const handleUpdateGlobalSettings = (newSettings: any) => {
    if (!activeWorkflow) return;
    setActiveWorkflow({
      ...activeWorkflow,
      globalPrompt: newSettings.globalPrompt,
      globalVoice: newSettings.globalVoice,
      globalLanguage: newSettings.globalLanguage,
      globalModel: newSettings.globalModel
    });
  };

  const handleExitDesigner = () => {
    setActiveWorkflow(null);
    setSelectedNodeId(null);
    setActiveNodeId(null);
  };

  const selectedNode = activeWorkflow?.nodes.find(n => n.id === selectedNodeId) || null;

  // 5. Render Loading & Error Views
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-5 py-32 max-w-7xl mx-auto">
        <Loader2 className="h-10 w-10 animate-spin text-black opacity-20" />
        <p className="font-mono text-[12px] uppercase tracking-widest opacity-40">
          Syncing visual flow schemas...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-20 text-center max-w-lg mx-auto">
        <AlertTriangle className="h-12 w-12 text-rose-500" />
        <h3 className="text-[20px] font-semibold text-black">Database Connection Error</h3>
        <p className="text-[14px] text-neutral-500 font-[320] leading-relaxed">
          {error}
        </p>
      </div>
    );
  }

  // 6. Landing Page & Visual Editor Canvas Shell
  if (!activeWorkflow) {
    return (
      <div className="flex flex-col gap-12 max-w-7xl mx-auto pt-4 pb-12 px-6 animate-fade-in">
        
        {/* Landing header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#999999]">
              <GitBranch className="h-3.5 w-3.5" />
              <span>LOGIC ORCHESTRATION</span>
            </div>
            <h1 className="text-6xl font-[340] tracking-[-0.03em] text-black">Workflows</h1>
            <p className="text-[#666666] text-[18px] max-w-2xl font-[320] leading-relaxed">
              Design visual call routers, REST webhooks, and variable triggers connected straight to your production voice agents.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#dfdfdf] gap-4">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('library')}
              className={`pb-3 text-[15px] font-semibold transition-all relative ${
                activeTab === 'library'
                  ? 'text-black border-b-2 border-black'
                  : 'text-[#999999] hover:text-black'
              }`}
            >
              Workflow Library
            </button>
            <button
              onClick={() => setActiveTab('agents')}
              className={`pb-3 text-[15px] font-semibold transition-all relative ${
                activeTab === 'agents'
                  ? 'text-black border-b-2 border-black'
                  : 'text-[#999999] hover:text-black'
              }`}
            >
              Active Agents
            </button>
          </div>
          {activeTab === 'library' && (
            <Button
              onClick={handleCreateStandaloneWorkflow}
              className="h-9 mb-3 rounded-full bg-black text-white px-5 text-[13px] font-medium transition-all hover:bg-black/90 flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Create Standalone Workflow
            </Button>
          )}
        </div>

        {/* Render Tab Contents */}
        {activeTab === 'library' ? (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-neutral-400" />
              <h3 className="text-[20px] font-[450] text-black tracking-tight">Workflow Templates</h3>
            </div>
            
            {workflows.length === 0 ? (
              <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-[24px] p-16 flex flex-col items-center justify-center text-center space-y-4">
                <WorkflowIcon className="h-10 w-10 text-neutral-300" />
                <div className="space-y-1">
                  <h4 className="text-[16px] font-[500] text-black">No Standalone Workflows Created</h4>
                  <p className="text-[13px] text-neutral-500 font-[320] max-w-[300px] leading-relaxed">
                    Create independent voice workflow templates and assign them to any of your active agents later.
                  </p>
                </div>
                <Button 
                  onClick={handleCreateStandaloneWorkflow}
                  className="h-10 rounded-full bg-black text-white px-6 text-[13px] hover:bg-black/90"
                >
                  Create Standalone Workflow
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {workflows.map((wf) => {
                  const nodeCount = wf.nodes?.length || 0;
                  return (
                    <div
                      key={wf.id}
                      onClick={() => handleSelectStandaloneWorkflow(wf)}
                      className="group relative cursor-pointer border border-[#dfdfdf] rounded-[24px] bg-white p-6 hover:border-black transition-all duration-300 shadow-sm flex flex-col justify-between h-[210px]"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="h-8 w-8 rounded-full bg-[#f7f7f5] group-hover:bg-indigo-50 flex items-center justify-center transition-colors shrink-0">
                              <GitBranch className="h-3.5 w-3.5 text-black" />
                            </div>
                            <h4 className="text-[16px] font-[500] text-black truncate group-hover:underline">{wf.name}</h4>
                          </div>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500 shrink-0">
                            {nodeCount} Nodes
                          </span>
                        </div>
                        <p className="text-[12px] text-neutral-500 font-[320] leading-relaxed line-clamp-3">
                          Click to design and edit the visual flow logic mapping for this workflow.
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between border-t pt-3 mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAssigningWorkflow(wf);
                          }}
                          className="text-[11px] font-semibold text-white bg-black hover:bg-neutral-800 px-3.5 py-1.5 rounded-full transition-all tracking-wide"
                        >
                          Assign to Agent
                        </button>
                        
                        <button
                          onClick={(e) => handleDeleteWorkflow(wf.id, e)}
                          className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 px-2 py-1"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-neutral-400" />
              <h3 className="text-[20px] font-[450] text-black tracking-tight">Select Agent to Design Logic</h3>
            </div>
            
            {agents.length === 0 ? (
              <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-[24px] p-16 flex flex-col items-center justify-center text-center space-y-4">
                <WorkflowIcon className="h-10 w-10 text-neutral-300" />
                <div className="space-y-1">
                  <h4 className="text-[16px] font-[500] text-black">No Active AI Agents Deployed</h4>
                  <p className="text-[13px] text-neutral-500 font-[320] max-w-[300px] leading-relaxed">
                    You need to deploy a voice agent before designing custom telephony routing logic workflows.
                  </p>
                </div>
                <Button asChild className="h-10 rounded-full bg-black text-white px-6 text-[13px]">
                  <a href="/dashboard/agents/new">Create First Agent</a>
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {agents.map((agent) => {
                  const hasCustomFlow = agent.kb_metadata?.workflow_data?.nodes?.length > 0;
                  return (
                    <div
                      key={agent.id}
                      onClick={() => handleSelectAgent(agent)}
                      className="group relative cursor-pointer border border-[#dfdfdf] rounded-[24px] bg-white p-6 hover:border-black transition-all duration-300 shadow-xs flex flex-col justify-between h-[200px]"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-[#f7f7f5] group-hover:bg-[#c8e6cd] flex items-center justify-center transition-colors">
                              <WorkflowIcon className="h-3.5 w-3.5 text-black" />
                            </div>
                            <h4 className="text-[16px] font-[500] text-black group-hover:underline truncate max-w-[150px]">{agent.name}</h4>
                          </div>
                          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                            hasCustomFlow ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-neutral-100 text-neutral-500'
                          }`}>
                            {hasCustomFlow ? 'Visual Flow' : 'Standard'}
                          </span>
                        </div>
                        <p className="text-[12px] text-neutral-500 font-[320] leading-relaxed line-clamp-3">
                          {agent.system_prompt ? agent.system_prompt.substring(0, 120) + '...' : 'No system instructions configured.'}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 border-t pt-3 mt-2">
                        <span>Voice: <strong className="text-neutral-600 capitalize">{agent.voice_id.startsWith("aura-2-") ? agent.voice_id.split("-")[2] : (agent.voice_id.split("-")[1] || agent.voice_id)}</strong></span>
                        <div className="flex items-center gap-3">
                          {hasCustomFlow && (
                            <button
                              onClick={(e) => handleDeleteAgentWorkflow(agent.id, e)}
                              className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                              title="Delete visual workflow from this agent"
                            >
                              Delete Flow
                            </button>
                          )}
                          <span className="text-black font-semibold group-hover:underline">Open Flow →</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Assign Workflow Dialog */}
        <Dialog open={!!assigningWorkflow} onOpenChange={(open) => !open && setAssigningWorkflow(null)}>
          <DialogContent className="sm:max-w-md rounded-[32px] border-[#e6e6e6] p-8 bg-white shadow-2xl overflow-hidden">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-[28px] font-[340] leading-tight tracking-tight text-center">
                Assign Workflow
              </DialogTitle>
              <DialogDescription className="text-center text-[14px] font-[330] opacity-60 leading-relaxed">
                Select an active agent to apply the visual flow logic of <strong className="text-black">{assigningWorkflow?.name}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4 max-h-[300px] overflow-y-auto">
              {agents.length === 0 ? (
                <p className="text-center text-sm text-neutral-400">No agents available.</p>
              ) : (
                agents.map((agent) => (
                  <button
                    key={agent.id}
                    disabled={isAssigning}
                    onClick={() => handleAssignWorkflow(agent.id)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-neutral-200 hover:border-black hover:bg-neutral-50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-xs uppercase">
                        {agent.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-black">{agent.name}</p>
                        <p className="text-[11px] text-neutral-400 capitalize">{agent.voice_id.startsWith("aura-2-") ? agent.voice_id.split("-")[2] : (agent.voice_id.split("-")[1] || agent.voice_id)}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-neutral-400 group-hover:text-black">Assign →</span>
                  </button>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

      </div>
    );
  }

  // 7. Visual Designer Canvas Shell
  return (
    <div className="absolute inset-0 bg-white flex flex-col overflow-hidden z-40 animate-fade-in select-none">
      
      {/* Visual Editor Custom Header Bar */}
      <div className="h-14 border-b border-[#dfdfdf] bg-white px-4 flex items-center justify-between shrink-0 select-none">
        
        {/* Left Side Metadata */}
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={handleExitDesigner}
            className="h-9 w-9 rounded-full border border-neutral-200 hover:bg-neutral-50 flex items-center justify-center shrink-0 transition-colors"
            title="Exit to Workflows"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div className="h-6 w-px bg-neutral-200 shrink-0" />
          <div className="flex flex-col min-w-0 justify-center">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={activeWorkflow.name}
                onChange={(e) => setActiveWorkflow({ ...activeWorkflow, name: e.target.value })}
                className="text-[16px] font-semibold text-black border-b border-transparent hover:border-neutral-300 focus:border-black focus:outline-none bg-transparent py-0.5 px-1 rounded-sm w-48"
              />
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/50 px-2 py-0.5 rounded-full text-[9px] font-mono font-medium">
                {activeWorkflow.agentId ? "Agent Flow" : "Standalone Template"}
              </span>
            </div>
          </div>
        </div>

        {/* Center Mode Tab-Switcher */}
        <div className="bg-neutral-100 p-0.5 rounded-xl flex">
          <button
            onClick={() => {
              setActiveViewTab('create');
              setActiveNodeId(null);
            }}
            className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
              activeViewTab === 'create'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            Create
          </button>
          <button
            onClick={() => setActiveViewTab('simulation')}
            className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
              activeViewTab === 'simulation'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            Simulation
          </button>
        </div>

        {/* Right Side Save status & Publish */}
        <div className="flex items-center gap-3">
          <span className={`text-[11px] font-mono transition-colors hidden md:inline ${
            saveStatus.includes('Saving') ? 'text-indigo-500 animate-pulse' : 'text-neutral-400'
          }`}>
            ● {saveStatus}
          </span>
          <div className="h-4 w-px bg-neutral-200 hidden md:inline" />
          <button className="h-9 w-9 rounded-full border border-neutral-200 hover:bg-neutral-50 flex items-center justify-center shrink-0 transition-colors">
            <Share2 className="h-4 w-4 text-neutral-600" />
          </button>
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="h-9 rounded-full bg-black text-white hover:bg-neutral-800 px-6 text-[13px] font-medium transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
          >
            {isPublishing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Compiling...
              </>
            ) : 'Publish'}
          </button>
        </div>

      </div>

      {/* Main Designer Workspace */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {activeViewTab === 'create' && (
          <NodePalette onAddNode={handleAddNode} />
        )}

        <WorkflowCanvas
          nodes={activeWorkflow.nodes}
          connections={activeWorkflow.connections}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          onUpdateNodes={handleUpdateNodes}
          onUpdateConnections={handleUpdateConnections}
          activeNodeId={activeNodeId}
          onAddNode={handleAddNode}
        />

        {activeViewTab === 'create' ? (
          <WorkflowSidebar
            selectedNode={selectedNode}
            onUpdateNode={handleUpdateNodeDetails}
            onDeleteNode={handleDeleteNode}
            globalSettings={{
              globalPrompt: activeWorkflow.globalPrompt,
              globalVoice: activeWorkflow.globalVoice,
              globalLanguage: activeWorkflow.globalLanguage,
              globalModel: activeWorkflow.globalModel,
              cfId: activeWorkflow.cfId,
              agentId: activeWorkflow.agentId
            }}
            onUpdateGlobalSettings={handleUpdateGlobalSettings}
            nodeList={activeWorkflow.nodes.map(n => ({ id: n.id, title: n.data.title }))}
          />
        ) : (
          <WorkflowSimulator
            nodes={activeWorkflow.nodes}
            connections={activeWorkflow.connections}
            activeNodeId={activeNodeId}
            setActiveNodeId={setActiveNodeId}
            onClose={() => setActiveViewTab('create')}
            agentId={activeWorkflow.agentId}
            workspaceId={workspaceId}
            authHeaders={authHeaders}
          />
        )}

      </div>
    </div>
  );
}
