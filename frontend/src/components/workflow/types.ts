export type NodeType =
  | 'conversation'
  | 'subagent'
  | 'function'
  | 'call_transfer'
  | 'press_digit'
  | 'logic_split'
  | 'agent_transfer'
  | 'in_call_sms'
  | 'extract_variable'
  | 'code'
  | 'mcp'
  | 'ending'
  | 'note';

export interface Position {
  x: number;
  y: number;
}

export interface NodeData {
  title: string;
  prompt?: string;
  subagentId?: string;
  apiUrl?: string;
  apiMethod?: 'GET' | 'POST';
  apiHeaders?: string;
  phoneNumber?: string;
  transferReason?: string;
  smsMessage?: string;
  digit?: string;
  variableName?: string;
  variableType?: 'string' | 'number' | 'boolean';
  codeSnippet?: string;
  mcpServer?: string;
  mcpTool?: string;
  noteText?: string;
  noteColor?: string;
  conditions?: {
    variable: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'exists';
    value: string;
    targetNodeId: string;
  }[];
  transitions?: {
    label: string;
    targetNodeId: string;
  }[];
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: Position;
  data: NodeData;
}

export interface WorkflowConnection {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string;
}

export interface Workflow {
  id: string;
  name: string;
  agentId: string;
  cfId: string;
  globalPrompt: string;
  globalVoice: string;
  globalLanguage: string;
  globalModel: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
}
