import React from 'react';
import {
  Settings,
  Trash2,
  HelpCircle,
  Sparkles,
  Globe,
  Plus,
  Play,
  PlayCircle
} from 'lucide-react';
import { WorkflowNode, NodeType } from './types';

interface WorkflowSidebarProps {
  selectedNode: WorkflowNode | null;
  onUpdateNode: (nodeId: string, updatedData: any) => void;
  onDeleteNode: (nodeId: string) => void;
  globalSettings: {
    globalPrompt: string;
    globalVoice: string;
    globalLanguage: string;
    globalModel: string;
    cfId: string;
    agentId: string;
  };
  onUpdateGlobalSettings: (settings: any) => void;
  nodeList: { id: string; title: string }[];
}

export function WorkflowSidebar({
  selectedNode,
  onUpdateNode,
  onDeleteNode,
  globalSettings,
  onUpdateGlobalSettings,
  nodeList
}: WorkflowSidebarProps) {
  
  const handleNodeFieldChange = (field: string, value: any) => {
    if (!selectedNode) return;
    onUpdateNode(selectedNode.id, {
      ...selectedNode.data,
      [field]: value
    });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedNode) return;
    onUpdateNode(selectedNode.id, {
      ...selectedNode.data,
      title: e.target.value
    });
  };

  // Node Type Config Form Rendering
  const renderNodeConfig = () => {
    if (!selectedNode) return null;
    const { type, data } = selectedNode;

    switch (type) {
      case 'conversation':
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">Agent Script / Instruction</label>
              <textarea
                value={data.prompt || ''}
                onChange={(e) => handleNodeFieldChange('prompt', e.target.value)}
                placeholder="Hello, thanks for calling. How can I help you today?"
                rows={5}
                className="w-full text-[13px] p-3 border border-neutral-200 rounded-xl outline-none focus:border-black bg-neutral-50 font-sans resize-none"
              />
            </div>
          </div>
        );

      case 'subagent':
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">Target Specialist Subagent</label>
              <select
                value={data.subagentId || ''}
                onChange={(e) => handleNodeFieldChange('subagentId', e.target.value)}
                className="w-full text-[13px] px-3 py-2 border border-neutral-200 rounded-xl bg-neutral-50 outline-none focus:border-black"
              >
                <option value="">Select Subagent...</option>
                <option value="billing_bot">Billing & Invoice Bot</option>
                <option value="scheduler_bot">Calendar & Booking Bot</option>
                <option value="triage_bot">Clinical Assessment Bot</option>
              </select>
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed font-[320]">
              The conversation will temporarily shift to the subagent, maintaining state variables, then return here once the subtask finishes.
            </p>
          </div>
        );

      case 'function':
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">REST API URL</label>
              <input
                type="text"
                value={data.apiUrl || ''}
                onChange={(e) => handleNodeFieldChange('apiUrl', e.target.value)}
                placeholder="https://api.clinic.com/v1/patients"
                className="w-full text-[13px] px-3 py-2 border border-neutral-200 rounded-xl bg-neutral-50 outline-none focus:border-black font-mono text-[12px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">Method</label>
                <select
                  value={data.apiMethod || 'POST'}
                  onChange={(e) => handleNodeFieldChange('apiMethod', e.target.value)}
                  className="w-full text-[13px] px-3 py-2 border border-neutral-200 rounded-xl bg-neutral-50 outline-none focus:border-black"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">Timeout (ms)</label>
                <input
                  type="number"
                  placeholder="2000"
                  className="w-full text-[13px] px-3 py-2 border border-neutral-200 rounded-xl bg-neutral-50 outline-none focus:border-black"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">Headers (JSON)</label>
              <textarea
                value={data.apiHeaders || ''}
                onChange={(e) => handleNodeFieldChange('apiHeaders', e.target.value)}
                placeholder='{ "Authorization": "Bearer key_..." }'
                rows={3}
                className="w-full text-[12px] p-3 border border-neutral-200 rounded-xl bg-neutral-50 outline-none focus:border-black font-mono"
              />
            </div>
          </div>
        );

      case 'call_transfer':
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">Phone Number (E.164)</label>
              <input
                type="text"
                value={data.phoneNumber || ''}
                onChange={(e) => handleNodeFieldChange('phoneNumber', e.target.value)}
                placeholder="+1 (555) 019-2834"
                className="w-full text-[13px] px-3 py-2 border border-neutral-200 rounded-xl bg-neutral-50 outline-none focus:border-black font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">Reason / Whisper Message</label>
              <input
                type="text"
                value={data.transferReason || ''}
                onChange={(e) => handleNodeFieldChange('transferReason', e.target.value)}
                placeholder="Routing to clinical oncology team"
                className="w-full text-[13px] px-3 py-2 border border-neutral-200 rounded-xl bg-neutral-50 outline-none focus:border-black"
              />
            </div>
          </div>
        );

      case 'press_digit':
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">DTMF Tones to Send</label>
              <input
                type="text"
                value={data.digit || ''}
                onChange={(e) => handleNodeFieldChange('digit', e.target.value)}
                placeholder="1"
                maxLength={3}
                className="w-full text-[13px] px-3 py-2 border border-neutral-200 rounded-xl bg-neutral-50 outline-none focus:border-black font-mono"
              />
            </div>
            <p className="text-[11px] text-neutral-500 font-[320] leading-relaxed">
              This simulates keypad options inside traditional interactive systems. E.g. Dialing extension lines.
            </p>
          </div>
        );

      case 'logic_split':
        return (
          <div className="space-y-4">
            <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">Branching Conditions</label>
            <div className="space-y-3">
              {(data.conditions || []).map((cond, index) => (
                <div key={index} className="p-3 border border-neutral-100 bg-neutral-50 rounded-xl space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={cond.variable}
                      placeholder="variable"
                      onChange={(e) => {
                        const newConditions = [...(data.conditions || [])];
                        newConditions[index].variable = e.target.value;
                        handleNodeFieldChange('conditions', newConditions);
                      }}
                      className="w-1/2 text-[12px] px-2 py-1 border border-neutral-200 rounded-lg outline-none bg-white font-mono"
                    />
                    <select
                      value={cond.operator}
                      onChange={(e) => {
                        const newConditions = [...(data.conditions || [])];
                        newConditions[index].operator = e.target.value as any;
                        handleNodeFieldChange('conditions', newConditions);
                      }}
                      className="w-1/2 text-[12px] px-2 py-1 border border-neutral-200 rounded-lg outline-none bg-white font-mono"
                    >
                      <option value="equals">==</option>
                      <option value="contains">contains</option>
                      <option value="greater_than">&gt;</option>
                      <option value="less_than">&lt;</option>
                      <option value="exists">exists</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={cond.value}
                      placeholder="value"
                      onChange={(e) => {
                        const newConditions = [...(data.conditions || [])];
                        newConditions[index].value = e.target.value;
                        handleNodeFieldChange('conditions', newConditions);
                      }}
                      className="w-1/2 text-[12px] px-2 py-1 border border-neutral-200 rounded-lg outline-none bg-white font-mono"
                    />
                    <select
                      value={cond.targetNodeId}
                      onChange={(e) => {
                        const newConditions = [...(data.conditions || [])];
                        newConditions[index].targetNodeId = e.target.value;
                        handleNodeFieldChange('conditions', newConditions);
                      }}
                      className="w-1/2 text-[12px] px-2 py-1 border border-neutral-200 rounded-lg outline-none bg-white"
                    >
                      <option value="">Next Node...</option>
                      {nodeList.filter(n => n.id !== selectedNode.id).map(n => (
                        <option key={n.id} value={n.id}>{n.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
              <button
                onClick={() => {
                  const newConditions = [...(data.conditions || []), { variable: '', operator: 'equals', value: '', targetNodeId: '' }];
                  handleNodeFieldChange('conditions', newConditions);
                }}
                className="w-full py-1.5 border border-dashed border-neutral-300 rounded-xl hover:bg-neutral-50 text-[12px] text-neutral-500 flex items-center justify-center gap-1 font-medium transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add Condition
              </button>
            </div>
          </div>
        );

      case 'in_call_sms':
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">SMS Body Message</label>
              <textarea
                value={data.smsMessage || ''}
                onChange={(e) => handleNodeFieldChange('smsMessage', e.target.value)}
                placeholder="Thanks for booking, your code is {{otp_code}}!"
                rows={4}
                className="w-full text-[13px] p-3 border border-neutral-200 rounded-xl bg-neutral-50 outline-none focus:border-black resize-none"
              />
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed font-[320]">
              Supports variable injection. Uses local cellular gateways to instantly SMS the current active caller.
            </p>
          </div>
        );

      case 'extract_variable':
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">Variable Key Name</label>
              <input
                type="text"
                value={data.variableName || ''}
                onChange={(e) => handleNodeFieldChange('variableName', e.target.value)}
                placeholder="patient_dob"
                className="w-full text-[13px] px-3 py-2 border border-neutral-200 rounded-xl bg-neutral-50 outline-none focus:border-black font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">Value Data Type</label>
              <select
                value={data.variableType || 'string'}
                onChange={(e) => handleNodeFieldChange('variableType', e.target.value as any)}
                className="w-full text-[13px] px-3 py-2 border border-neutral-200 rounded-xl bg-neutral-50 outline-none focus:border-black"
              >
                <option value="string">String (Text)</option>
                <option value="number">Number (Integer/Float)</option>
                <option value="boolean">Boolean (True/False)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">Extraction Prompt</label>
              <textarea
                value={data.prompt || ''}
                onChange={(e) => handleNodeFieldChange('prompt', e.target.value)}
                placeholder="Extract the date of birth the patient specified. Convert to MM/DD/YYYY format."
                rows={3}
                className="w-full text-[13px] p-3 border border-neutral-200 rounded-xl bg-neutral-50 outline-none focus:border-black resize-none"
              />
            </div>
          </div>
        );

      case 'code':
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">Sandbox Code (ES6 Javascript)</label>
              <textarea
                value={data.codeSnippet || ''}
                onChange={(e) => handleNodeFieldChange('codeSnippet', e.target.value)}
                placeholder={`// Access active variables via "context"\nconst age = calculateAge(context.dob);\nreturn { age, eligible: age > 18 };`}
                rows={8}
                className="w-full p-3 border border-neutral-200 rounded-xl bg-[#1e1e1e] text-[#d4d4d4] font-mono text-[12px] outline-none focus:border-indigo-400 resize-none leading-relaxed"
              />
            </div>
          </div>
        );

      case 'note':
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">Note Content</label>
              <textarea
                value={data.noteText || ''}
                onChange={(e) => handleNodeFieldChange('noteText', e.target.value)}
                placeholder="TODO: Integrate custom healthcare databases before sandbox release..."
                rows={4}
                className="w-full text-[13px] p-3 border border-neutral-200 rounded-xl bg-neutral-50 outline-none focus:border-black resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">Banner Background Color</label>
              <div className="flex gap-2.5">
                {['#fef9c3', '#dbeafe', '#dcfce7', '#fee2e2', '#f3e8ff'].map(color => (
                  <button
                    key={color}
                    onClick={() => handleNodeFieldChange('noteColor', color)}
                    style={{ backgroundColor: color }}
                    className={`h-7 w-7 rounded-full border border-neutral-300 transition-all ${
                      data.noteColor === color ? 'ring-2 ring-black ring-offset-2' : ''
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <p className="text-[12px] text-neutral-400 font-mono py-8 text-center bg-neutral-50 rounded-xl border border-dashed">
            No dynamic configs required.
          </p>
        );
    }
  };

  return (
    <div className="w-[340px] border-l border-[#dfdfdf] bg-white flex flex-col h-full shrink-0 select-none overflow-y-auto">
      {selectedNode ? (
        // Selected Node inspector
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-[#dfdfdf] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-black" />
              <span className="text-[14px] font-[500] text-black">Node Properties</span>
            </div>
            <button
              onClick={() => onDeleteNode(selectedNode.id)}
              className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-500 transition-colors"
              title="Delete node"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Core Info */}
          <div className="p-4 space-y-4 flex-1">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">Node Identifier</label>
              <input
                type="text"
                value={selectedNode.data.title}
                onChange={handleTitleChange}
                className="w-full text-[14px] font-[500] px-3 py-2 border border-neutral-200 rounded-xl outline-none focus:border-black bg-neutral-50"
              />
            </div>
            
            <div className="h-px bg-neutral-100" />

            {/* Type Specific Fields */}
            {renderNodeConfig()}
          </div>
        </div>
      ) : (
        // Global Agent Settings panel (Default)
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-[#dfdfdf] flex items-center gap-2">
            <Settings className="h-4 w-4 text-neutral-600" />
            <span className="text-[14px] font-[500] text-black">Global Settings</span>
          </div>

          <div className="p-4 space-y-5 overflow-y-auto flex-1">
            {/* Agent info */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
                <span>Agent ID</span>
                <span className="text-black font-medium">{globalSettings.agentId}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
                <span>Deployment CF ID</span>
                <span className="text-black font-medium">{globalSettings.cfId}</span>
              </div>
            </div>

            {/* Voice select */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" /> Voice & Language
                </label>
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              </div>
              <select
                value={globalSettings.globalVoice}
                onChange={(e) => onUpdateGlobalSettings({ ...globalSettings, globalVoice: e.target.value })}
                className="w-full text-[13px] px-3 py-2 border border-neutral-200 rounded-xl outline-none focus:border-black"
              >
                <option value="eleven_anna">English US (Female - Anna / ElevenLabs)</option>
                <option value="eleven_bill">English US (Male - Bill / ElevenLabs)</option>
                <option value="play_serena">English GB (Female - Serena / Play.ht)</option>
                <option value="vapi_pedro">Spanish MX (Male - Pedro / Vapi)</option>
              </select>
            </div>

            {/* LLM Engine */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">Global Prompt Model</label>
              <select
                value={globalSettings.globalModel}
                onChange={(e) => onUpdateGlobalSettings({ ...globalSettings, globalModel: e.target.value })}
                className="w-full text-[13px] px-3 py-2 border border-neutral-200 rounded-xl outline-none focus:border-black"
              >
                <option value="gpt-4o-mini">GPT-4o Mini (Cost Effective / Fast)</option>
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Nuanced Dialogue)</option>
              </select>
            </div>

            <div className="h-px bg-neutral-100" />

            {/* Agent objective prompt */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">Global Prompt / Handbook</label>
              <textarea
                value={globalSettings.globalPrompt}
                onChange={(e) => onUpdateGlobalSettings({ ...globalSettings, globalPrompt: e.target.value })}
                rows={8}
                className="w-full text-[13px] p-3 border border-neutral-200 rounded-xl outline-none focus:border-black bg-neutral-50 font-mono resize-none leading-relaxed text-[12px]"
                placeholder="Define overall system constraints..."
              />
            </div>

            <div className="p-3.5 bg-yellow-50/50 border border-yellow-100 rounded-xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-yellow-700 font-medium text-[12px]">
                <HelpCircle className="h-4 w-4" />
                <span>Tip: Inject Variables</span>
              </div>
              <p className="text-[11px] text-yellow-700/80 font-[320] leading-relaxed">
                Use double braces like <code className="bg-yellow-100/50 px-1 py-0.5 rounded font-mono font-[400] text-[10px]">{`{{customer_name}}`}</code> in dialogues to inject dynamic patient/customer details.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
