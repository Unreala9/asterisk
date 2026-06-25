import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  Send,
  User,
  Bot,
  Play,
  ArrowRight,
  Settings,
  ShieldCheck,
  RefreshCw,
  PlayCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { WorkflowNode, WorkflowConnection } from './types';

interface WorkflowSimulatorProps {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  activeNodeId: string | null;
  setActiveNodeId: (nodeId: string | null) => void;
  onClose: () => void;
  agentId?: string;
  workspaceId?: string | null;
  authHeaders?: Record<string, string> | null;
}

interface Message {
  sender: 'agent' | 'user' | 'system';
  text: string;
  timestamp: string;
}

export function WorkflowSimulator({
  nodes,
  connections,
  activeNodeId,
  setActiveNodeId,
  onClose,
  agentId,
  workspaceId,
  authHeaders
}: WorkflowSimulatorProps) {
  const [callState, setCallState] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  
  // Real telephone call states
  const [physicalNumber, setPhysicalNumber] = useState('');
  const [isPlacingPhysical, setIsPlacingPhysical] = useState(false);

  const handlePhysicalCall = async () => {
    if (!agentId || !workspaceId || !authHeaders || !physicalNumber.trim()) {
      toast.error("Database connection session is initializing. Please wait...");
      return;
    }
    
    setIsPlacingPhysical(true);
    const apiUrl = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

    try {
      const res = await fetch(
        `${apiUrl}/api/v1/workspaces/${workspaceId}/agents/${agentId}/test-call`,
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({ to_number: physicalNumber.trim() }),
        }
      );
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || `Error ${res.status}`);
      
      toast.success("📞 Physical test call successfully initiated! Check your phone.");
      addMessage('system', `🟢 PHYSICAL TEST CALL PLACED to: ${physicalNumber.trim()}`);
    } catch (err) {
      toast.error(`🔴 Test call failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsPlacingPhysical(false);
    }
  };
  const [variables, setVariables] = useState<Record<string, string>>({
    customer_name: '',
    dob: '',
    customer_zip: '94061'
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle auto conversation steps based on active node type
  useEffect(() => {
    if (callState !== 'connected' || !activeNodeId) return;

    const currentNode = nodes.find(n => n.id === activeNodeId);
    if (!currentNode) return;

    // Simulate different nodes
    const timer = setTimeout(() => {
      switch (currentNode.type) {
        case 'conversation': {
          let text = currentNode.data.prompt || "How can I help you today?";
          // Variable injection
          text = text.replace(/\{\{customer_name\}\}/g, variables.customer_name || 'there');
          text = text.replace(/\{\{dob\}\}/g, variables.dob || 'your date of birth');
          text = text.replace(/\{\{customer_zip\}\}/g, variables.customer_zip || '94061');
          
          addMessage('agent', text);
          break;
        }
        case 'extract_variable': {
          addMessage('system', `Parsing transcript for variable: "${currentNode.data.variableName}"...`);
          // Automatically proceed to the next linked node
          const nextConn = connections.find(c => c.sourceId === currentNode.id);
          if (nextConn) {
            setActiveNodeId(nextConn.targetId);
          } else {
            addMessage('system', "Workflow completed at variable extraction node.");
            setCallState('ended');
          }
          break;
        }
        case 'function': {
          addMessage('system', `Executing mock API call to ${currentNode.data.apiUrl || 'endpoint'}...`);
          setTimeout(() => {
            addMessage('system', "🟢 API Status 200: Handshake successful.");
            const nextConn = connections.find(c => c.sourceId === currentNode.id);
            if (nextConn) {
              setActiveNodeId(nextConn.targetId);
            }
          }, 1200);
          break;
        }
        case 'in_call_sms': {
          let text = currentNode.data.smsMessage || "SMS confirmation sent.";
          text = text.replace(/\{\{customer_name\}\}/g, variables.customer_name || 'Guest');
          addMessage('system', `🔔 SMS SENT: "${text}"`);
          const nextConn = connections.find(c => c.sourceId === currentNode.id);
          if (nextConn) {
            setActiveNodeId(nextConn.targetId);
          }
          break;
        }
        case 'call_transfer': {
          addMessage('system', `📞 Connecting call to human representative at ${currentNode.data.phoneNumber || '+1 555-0100'}...`);
          addMessage('system', `Whisper Reason: "${currentNode.data.transferReason || 'Triage transfer'}"`);
          setTimeout(() => {
            addMessage('system', "Call successfully hand-off to Live Nurse Desk.");
            setCallState('ended');
          }, 1500);
          break;
        }
        case 'ending': {
          addMessage('agent', "Thank you for your time. Goodbye!");
          setTimeout(() => {
            addMessage('system', "Call hung up by voice agent.");
            setCallState('ended');
          }, 1000);
          break;
        }
        case 'logic_split': {
          addMessage('system', "Analyzing branching logic split conditions...");
          const conditions = currentNode.data.conditions || [];
          let targetId = '';
          
          for (const cond of conditions) {
            const varVal = variables[cond.variable] || '';
            let matched = false;
            
            if (cond.operator === 'equals' && varVal.toLowerCase() === cond.value.toLowerCase()) matched = true;
            if (cond.operator === 'contains' && varVal.toLowerCase().includes(cond.value.toLowerCase())) matched = true;
            if (cond.operator === 'exists' && varVal !== '') matched = true;

            if (matched && cond.targetNodeId) {
              targetId = cond.targetNodeId;
              addMessage('system', `✅ Route match: "${cond.variable}" ${cond.operator} "${cond.value}"`);
              break;
            }
          }

          // Fallback: regular transition or first condition or hangup
          if (!targetId && conditions.length > 0 && conditions[0].targetNodeId) {
            targetId = conditions[0].targetNodeId;
          }
          
          if (!targetId) {
            const nextConn = connections.find(c => c.sourceId === currentNode.id);
            if (nextConn) targetId = nextConn.targetId;
          }

          if (targetId) {
            setActiveNodeId(targetId);
          } else {
            addMessage('system', "Branch matching failed. Terminating call.");
            setCallState('ended');
          }
          break;
        }
        default: {
          // Fallback to next connection
          const nextConn = connections.find(c => c.sourceId === currentNode.id);
          if (nextConn) {
            setActiveNodeId(nextConn.targetId);
          }
          break;
        }
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [activeNodeId, callState]);

  const addMessage = (sender: 'agent' | 'user' | 'system', text: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setMessages(prev => [...prev, { sender, text, timestamp: time }]);
  };

  const startCall = () => {
    setCallState('calling');
    setMessages([]);
    addMessage('system', 'Dialing voice agent Anna...');
    
    setTimeout(() => {
      setCallState('connected');
      // Find starting node (node with no incoming connections, or usually conversation at top left)
      const startNode = nodes.find(n => n.type === 'conversation') || nodes[0];
      if (startNode) {
        setActiveNodeId(startNode.id);
      }
    }, 1200);
  };

  const endCall = () => {
    addMessage('system', 'Call ended by user.');
    setCallState('ended');
    setActiveNodeId(null);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeNodeId) return;

    const userText = inputText.trim();
    addMessage('user', userText);
    setInputText('');

    const currentNode = nodes.find(n => n.id === activeNodeId);
    if (!currentNode) return;

    // Mock variable extraction based on user input
    let updatedVars = { ...variables };
    let variableExtracted = false;

    // Simple rule-based mock extraction
    if (currentNode.data.title.toLowerCase().includes('name') || activeNodeId === 'node-greeting') {
      updatedVars.customer_name = userText;
      variableExtracted = true;
    } else if (currentNode.data.title.toLowerCase().includes('dob') || userText.match(/\d/)) {
      updatedVars.dob = userText;
      variableExtracted = true;
    }

    if (variableExtracted) {
      setVariables(updatedVars);
      addMessage('system', `Parsed values: ${JSON.stringify(updatedVars, null, 2)}`);
    }

    // Progress flow: find next connection
    const nextConn = connections.find(c => c.sourceId === activeNodeId);
    if (nextConn) {
      setActiveNodeId(nextConn.targetId);
    } else {
      // Loop backup for Patient Screening demo
      if (activeNodeId === 'node-greeting') {
        setActiveNodeId('node-dob');
      } else if (activeNodeId === 'node-dob') {
        setActiveNodeId('node-logic');
      } else {
        addMessage('system', 'Dialogue reached end of current branch path.');
        setCallState('ended');
      }
    }
  };

  const resetVariables = () => {
    setVariables({
      customer_name: '',
      dob: '',
      customer_zip: '94061'
    });
    addMessage('system', 'Variables reset to default.');
  };

  return (
    <div className="w-[340px] border-l border-[#dfdfdf] bg-white flex flex-col h-full shrink-0 select-none overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#dfdfdf] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PlayCircle className="h-4.5 w-4.5 text-emerald-500" />
          <span className="text-[14px] font-[500] text-black">Interactive Call Sandbox</span>
        </div>
      </div>

      {/* Simulator Body */}
      <div className="flex-1 flex flex-col min-h-0 bg-neutral-50/50">
        
        {/* Call Panel */}
        <div className="p-5 flex flex-col items-center justify-center border-b border-neutral-100 bg-white gap-4 shadow-sm">
          {callState === 'connected' ? (
            <div className="relative flex items-center justify-center">
              {/* Pulsing microphone effect */}
              <div className="absolute h-16 w-16 bg-emerald-100 rounded-full animate-ping opacity-60" />
              <div className="absolute h-12 w-12 bg-emerald-200/70 rounded-full animate-pulse" />
              <div className="relative h-10 w-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg text-white">
                <Phone className="h-4.5 w-4.5" />
              </div>
            </div>
          ) : (
            <div className="h-10 w-10 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400 border">
              <Phone className="h-4.5 w-4.5" />
            </div>
          )}

          <div className="text-center space-y-1">
            <span className="text-[12px] font-mono uppercase tracking-widest text-neutral-400">
              {callState === 'idle' && 'Idle Sandbox'}
              {callState === 'calling' && 'Initiating SIP Stream...'}
              {callState === 'connected' && 'Call Active (Latency ~980ms)'}
              {callState === 'ended' && 'Call Terminated'}
            </span>
            <h4 className="text-[16px] font-[500] text-black">
              {callState === 'connected' ? 'Mock Customer (Evie Wang)' : 'Test AI Agent Anna'}
            </h4>
          </div>

          <div className="flex gap-2 w-full">
            {callState !== 'connected' && callState !== 'calling' ? (
              <button
                onClick={startCall}
                className="flex-1 py-2 bg-emerald-500 text-white rounded-full text-[13px] font-medium hover:bg-emerald-600 active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Phone className="h-4 w-4" />
                Start Test Call
              </button>
            ) : (
              <button
                onClick={endCall}
                className="flex-1 py-2 bg-rose-500 text-white rounded-full text-[13px] font-medium hover:bg-rose-600 active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <PhoneOff className="h-4 w-4" />
                Hang Up
              </button>
            )}
          </div>

          {/* Real physical telephone call simulation */}
          <div className="w-full border-t border-dashed border-neutral-200 pt-4 mt-1 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
              <span>📞 Place Physical Test Call</span>
              <span className="bg-amber-50 text-amber-600 border border-amber-200/50 px-1.5 py-0.5 rounded text-[8px] font-bold tracking-tight">Live Telephone</span>
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="+91 (555) 012-3456"
                value={physicalNumber}
                onChange={(e) => setPhysicalNumber(e.target.value)}
                className="flex-1 text-[12px] px-3 py-1.5 bg-neutral-50 border border-neutral-250 rounded-xl outline-none focus:border-black font-mono"
              />
              <button
                type="button"
                onClick={handlePhysicalCall}
                disabled={isPlacingPhysical || !physicalNumber.trim()}
                className="bg-black hover:bg-neutral-800 disabled:opacity-40 text-white px-4 py-1.5 rounded-xl text-[12px] font-semibold transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {isPlacingPhysical ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Dialing
                  </>
                ) : 'Ring Phone'}
              </button>
            </div>
          </div>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-neutral-400 space-y-3">
              <Bot className="h-8 w-8 text-neutral-300 animate-bounce" />
              <p className="text-[12px] font-[320] max-w-[200px] leading-relaxed">
                Click **Start Test Call** above to initiate voice interaction simulation and step through active path nodes.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400 mb-1">
                  {msg.sender === 'agent' && (
                    <>
                      <Bot className="h-3 w-3 text-rose-500" />
                      <span>Anna (Voice)</span>
                    </>
                  )}
                  {msg.sender === 'user' && (
                    <>
                      <User className="h-3 w-3 text-neutral-600" />
                      <span>Caller</span>
                    </>
                  )}
                  {msg.sender === 'system' && (
                    <>
                      <ShieldCheck className="h-3 w-3 text-indigo-500" />
                      <span>Orchestrator Execution</span>
                    </>
                  )}
                  <span>• {msg.timestamp}</span>
                </div>
                <div
                  className={`text-[13px] px-3.5 py-2 rounded-2xl max-w-[85%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-black text-white rounded-tr-sm'
                      : msg.sender === 'agent'
                      ? 'bg-rose-50 border border-rose-100 text-rose-950 rounded-tl-sm'
                      : 'bg-indigo-50/70 border border-indigo-100/50 text-indigo-950 font-mono text-[11px] rounded-lg'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Sandbox Variables & Input */}
        <div className="p-3 bg-white border-t border-neutral-100 space-y-3">
          {/* Active Context variables dashboard */}
          <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-150 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase text-neutral-400">
              <span>Active Context Frame</span>
              <button
                onClick={resetVariables}
                className="hover:text-black flex items-center gap-0.5 transition-colors"
                title="Reset environment variables"
              >
                <RefreshCw className="h-2.5 w-2.5" /> Reset
              </button>
            </div>
            <div className="grid grid-cols-1 gap-1 text-[11px] font-mono">
              <div className="flex justify-between border-b border-dashed border-neutral-200 pb-1">
                <span className="text-neutral-400">customer_name:</span>
                <span className="text-black font-medium truncate max-w-[150px]">
                  {variables.customer_name ? `"${variables.customer_name}"` : 'null'}
                </span>
              </div>
              <div className="flex justify-between border-b border-dashed border-neutral-200 pb-1">
                <span className="text-neutral-400">dob:</span>
                <span className="text-black font-medium truncate max-w-[150px]">
                  {variables.dob ? `"${variables.dob}"` : 'null'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">customer_zip:</span>
                <span className="text-black font-medium">"{variables.customer_zip}"</span>
              </div>
            </div>
          </div>

          {/* User speech simulation textbox input */}
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={callState !== 'connected'}
              placeholder={
                callState === 'connected'
                  ? 'Speak responses (e.g. Evie Wang)...'
                  : 'Start call to speak...'
              }
              className="flex-1 text-[13px] px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-full outline-none focus:border-black focus:bg-white disabled:opacity-50 transition-all"
            />
            <button
              type="submit"
              disabled={callState !== 'connected' || !inputText.trim()}
              className="h-9 w-9 rounded-full bg-black text-white hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-black transition-colors shrink-0 flex items-center justify-center shadow-sm"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
