import React, { useState, useRef, useEffect } from 'react';
import {
  MousePointer,
  Hand,
  ZoomIn,
  ZoomOut,
  Maximize2,
  GitCommit,
  Plus,
  HelpCircle,
  Hash,
  MessageSquare,
  Users,
  Terminal,
  PhoneForwarded,
  GitBranch,
  UserCheck,
  MessageCircle,
  Binary,
  Code as CodeIcon,
  Cpu,
  PowerOff,
  StickyNote,
  Trash2
} from 'lucide-react';
import { WorkflowNode, WorkflowConnection, NodeType, Position } from './types';

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onUpdateNodes: (nodes: WorkflowNode[]) => void;
  onUpdateConnections: (connections: WorkflowConnection[]) => void;
  activeNodeId: string | null;
  onAddNode?: (type: NodeType, position: Position) => void;
}

export function WorkflowCanvas({
  nodes,
  connections,
  selectedNodeId,
  onSelectNode,
  onUpdateNodes,
  onUpdateConnections,
  activeNodeId,
  onAddNode
}: WorkflowCanvasProps) {
  const [panOffset, setPanOffset] = useState<Position>({ x: 100, y: 80 });
  const [zoom, setZoom] = useState<number>(0.95);
  const [activeTool, setActiveTool] = useState<'select' | 'hand'>('select');
  
  // Dragging state
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 });
  const [nodeDragStartPos, setNodeDragStartPos] = useState<Position>({ x: 0, y: 0 });
  const [hasDraggedNode, setHasDraggedNode] = useState<boolean>(false);

  // Connection drawing and selection state
  const [drawingConnection, setDrawingConnection] = useState<{
    sourceId: string;
    portIndex?: number;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [hoveredInputNodeId, setHoveredInputNodeId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleStartConnection = (e: React.MouseEvent, nodeId: string, portIndex?: number) => {
    if (activeTool === 'hand') return;
    e.stopPropagation();

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    let totalConds = 1;
    if (node.type === 'logic_split') {
      totalConds = (node.data.conditions || []).length + 1;
    }

    const portPos = getPortCoordinates(nodeId, 'out', portIndex, totalConds);

    setDrawingConnection({
      sourceId: nodeId,
      portIndex,
      startX: portPos.x,
      startY: portPos.y,
      currentX: portPos.x,
      currentY: portPos.y
    });
  };

  const createNewConnection = (sourceId: string, targetId: string, portIndex?: number) => {
    const sourceNode = nodes.find(n => n.id === sourceId);
    if (!sourceNode) return;

    let newConnections = [...connections];

    if (sourceNode.type !== 'logic_split') {
      // Check if a connection from sourceId to targetId already exists to prevent duplicates
      const isDuplicate = newConnections.some(c => c.sourceId === sourceId && c.targetId === targetId);
      if (!isDuplicate) {
        newConnections.push({
          id: `conn-${Date.now()}`,
          sourceId,
          targetId
        });
        onUpdateConnections(newConnections);
      }
    } else {
      // For logic_split, update the specific condition targetNodeId.
      const conditions = [...(sourceNode.data.conditions || [])];
      
      if (portIndex !== undefined && portIndex < conditions.length) {
        // Re-routing an existing condition branch
        const oldTargetId = conditions[portIndex].targetNodeId;
        conditions[portIndex] = {
          ...conditions[portIndex],
          targetNodeId: targetId
        };
        
        // Update connections list:
        // Filter out any connection from this sourceNode to either oldTargetId or targetId
        newConnections = newConnections.filter(c => !(c.sourceId === sourceId && (c.targetId === oldTargetId || c.targetId === targetId)));
        
        const cond = conditions[portIndex];
        const label = `${cond.variable} ${cond.operator === 'equals' ? '==' : cond.operator} ${cond.value}`;
        
        newConnections.push({
          id: `conn-${Date.now()}-${portIndex}`,
          sourceId,
          targetId,
          label
        });

        // Update both nodes and connections
        onUpdateNodes(nodes.map(n => n.id === sourceId ? { ...n, data: { ...n.data, conditions } } : n));
        onUpdateConnections(newConnections);
      } else {
        // Re-routing the default fallback branch (the last port)
        const condTargets = conditions.map(c => c.targetNodeId);
        newConnections = newConnections.filter(c => !(c.sourceId === sourceId && !condTargets.includes(c.targetId)));
        
        newConnections.push({
          id: `conn-${Date.now()}-default`,
          sourceId,
          targetId
        });
        
        onUpdateConnections(newConnections);
      }
    }
  };

  const handleDeleteConnection = (connId: string) => {
    const conn = connections.find(c => c.id === connId);
    if (!conn) return;

    const newConnections = connections.filter(c => c.id !== connId);

    // If source was a logic_split, clear the condition's targetNodeId
    const sourceNode = nodes.find(n => n.id === conn.sourceId);
    if (sourceNode && sourceNode.type === 'logic_split') {
      const conditions = (sourceNode.data.conditions || []).map(cond => {
        if (cond.targetNodeId === conn.targetId) {
          return { ...cond, targetNodeId: '' };
        }
        return cond;
      });
      onUpdateNodes(nodes.map(n => n.id === sourceNode.id ? { ...n, data: { ...n.data, conditions } } : n));
    }

    onUpdateConnections(newConnections);
    setSelectedConnectionId(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!containerRef.current || !onAddNode) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const canvasX = (mouseX - panOffset.x) / zoom;
    const canvasY = (mouseY - panOffset.y) / zoom;

    // Center the node card (240px wide, 140px high) under the drop cursor
    const adjustedX = Math.round((canvasX - 120) / 5) * 5;
    const adjustedY = Math.round((canvasY - 70) / 5) * 5;
    
    const nodeType = e.dataTransfer.getData('text/plain') as NodeType;
    if (nodeType) {
      onAddNode(nodeType, { x: adjustedX, y: adjustedY });
    }
  };

  // Keyboard listener for Space key (activates hand tool temporarily)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && activeTool !== 'hand' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setActiveTool('hand');
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && activeTool === 'hand') {
        setActiveTool('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeTool]);

  // Handle Mouse Events for Panning and Dragging Nodes
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setDragStart({ x: mouseX, y: mouseY });

    // 1. Hand tool or Middle Click -> Pan Canvas
    if (activeTool === 'hand' || e.button === 1) {
      setIsPanning(true);
      setPanStart({ ...panOffset });
      e.preventDefault();
      return;
    }

    // 2. Select Tool -> Check if we clicked a node (bubbled down or hit target)
    const targetNodeElement = (e.target as HTMLElement).closest('.workflow-node-card');
    if (targetNodeElement) {
      const nodeId = targetNodeElement.getAttribute('data-node-id');
      if (nodeId) {
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
          setDraggedNodeId(nodeId);
          setNodeDragStartPos({ ...node.position });
          setHasDraggedNode(false);
          onSelectNode(nodeId);
          setSelectedConnectionId(null); // Clear selected connection
          e.stopPropagation();
        }
      }
    } else {
      // Clicked blank canvas background -> Pan instead (if select tool background drag is also allowed)
      setIsPanning(true);
      setPanStart({ ...panOffset });
      onSelectNode(null);
      setSelectedConnectionId(null); // Clear selected connection
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const dx = mouseX - dragStart.x;
    const dy = mouseY - dragStart.y;

    if (isPanning) {
      setPanOffset({
        x: panStart.x + dx,
        y: panStart.y + dy
      });
      return;
    }

    if (drawingConnection) {
      const canvasMouseX = (mouseX - panOffset.x) / zoom;
      const canvasMouseY = (mouseY - panOffset.y) / zoom;
      setDrawingConnection({
        ...drawingConnection,
        currentX: canvasMouseX,
        currentY: canvasMouseY
      });

      // Hit-test for input port under the mouse
      const element = document.elementFromPoint(e.clientX, e.clientY);
      const portEl = element?.closest('[data-port-input-node-id]');
      const targetNodeId = portEl?.getAttribute('data-port-input-node-id') || null;
      if (targetNodeId !== hoveredInputNodeId) {
        setHoveredInputNodeId(targetNodeId);
      }
      return;
    }

    if (draggedNodeId) {
      // Calculate zoomed displacement
      const nextX = nodeDragStartPos.x + dx / zoom;
      const nextY = nodeDragStartPos.y + dy / zoom;
      
      // Snapping to grid (optional, but 5px steps keeps it neat)
      const snappedX = Math.round(nextX / 5) * 5;
      const snappedY = Math.round(nextY / 5) * 5;

      setHasDraggedNode(true);
      onUpdateNodes(
        nodes.map(n =>
          n.id === draggedNodeId
            ? { ...n, position: { x: snappedX, y: snappedY } }
            : n
        )
      );
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    setIsPanning(false);
    setDraggedNodeId(null);

    if (drawingConnection) {
      if (hoveredInputNodeId && hoveredInputNodeId !== drawingConnection.sourceId) {
        createNewConnection(drawingConnection.sourceId, hoveredInputNodeId, drawingConnection.portIndex);
      }
      setDrawingConnection(null);
      setHoveredInputNodeId(null);
    }
  };

  // Node Colors matching NodePalette icons
  const getNodeColorTheme = (type: NodeType) => {
    switch (type) {
      case 'conversation': return { headerBg: 'bg-rose-500', iconBg: 'bg-rose-600', icon: MessageSquare };
      case 'subagent': return { headerBg: 'bg-emerald-500', iconBg: 'bg-emerald-600', icon: Users };
      case 'function': return { headerBg: 'bg-purple-500', iconBg: 'bg-purple-600', icon: Terminal };
      case 'call_transfer': return { headerBg: 'bg-orange-500', iconBg: 'bg-orange-600', icon: PhoneForwarded };
      case 'press_digit': return { headerBg: 'bg-blue-500', iconBg: 'bg-blue-600', icon: Hash };
      case 'logic_split': return { headerBg: 'bg-indigo-500', iconBg: 'bg-indigo-600', icon: GitBranch };
      case 'agent_transfer': return { headerBg: 'bg-amber-500', iconBg: 'bg-amber-600', icon: UserCheck };
      case 'in_call_sms': return { headerBg: 'bg-teal-500', iconBg: 'bg-teal-600', icon: MessageCircle };
      case 'extract_variable': return { headerBg: 'bg-slate-500', iconBg: 'bg-slate-600', icon: Binary };
      case 'code': return { headerBg: 'bg-neutral-600', iconBg: 'bg-neutral-700', icon: CodeIcon };
      case 'mcp': return { headerBg: 'bg-fuchsia-500', iconBg: 'bg-fuchsia-600', icon: Cpu };
      case 'ending': return { headerBg: 'bg-red-500', iconBg: 'bg-red-600', icon: PowerOff };
      case 'note': return { headerBg: 'bg-yellow-400', iconBg: 'bg-yellow-500', icon: StickyNote };
      default: return { headerBg: 'bg-neutral-500', iconBg: 'bg-neutral-600', icon: HelpCircle };
    }
  };

  // Node Dimensions
  const nodeWidth = 240;
  const nodeHeight = 140;

  // Helper to determine condition index and total conditions for drawing connections
  const getConnectionPortDetails = (conn: WorkflowConnection, sourceNode: WorkflowNode) => {
    let condIndex: number | undefined = undefined;
    let totalConds: number | undefined = undefined;

    if (sourceNode.type === 'logic_split') {
      const conditions = sourceNode.data.conditions || [];
      totalConds = conditions.length + 1; // conditions + default

      // 1. Try to find by matching targetNodeId in conditions
      let idx = conditions.findIndex(c => c.targetNodeId === conn.targetId);

      // 2. If not found, try to parse the index from the connection ID suffix
      if (idx === -1) {
        const parts = conn.id.split('-');
        const lastPart = parts[parts.length - 1];
        if (lastPart !== 'default' && !isNaN(Number(lastPart))) {
          idx = Number(lastPart);
        }
      }

      // 3. If still not found, try to match by comparing labels
      if (idx === -1 && conn.label) {
        idx = conditions.findIndex(c => {
          const condLabel = `${c.variable} ${c.operator === 'equals' ? '==' : c.operator} ${c.value}`;
          return condLabel.trim() === conn.label?.trim();
        });
      }

      if (idx !== -1 && idx < conditions.length) {
        condIndex = idx;
      } else {
        condIndex = conditions.length; // default route port at the bottom
      }
    }

    return { condIndex, totalConds };
  };

  // Calculate anchor port positions for connections
  const getPortCoordinates = (nodeId: string, portType: 'in' | 'out', condIndex?: number, totalConds?: number) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };

    if (portType === 'in') {
      // Inward port is in the center of the left edge of the node card
      return {
        x: node.position.x,
        y: node.position.y + 60
      };
    } else {
      // Outward port is on the right edge.
      // If logic_split node with conditional paths, stack them vertically along the right card side.
      if (node.type === 'logic_split' && condIndex !== undefined) {
        const portCenterY = 81 + 26 * condIndex;
        return {
          x: node.position.x + nodeWidth,
          y: node.position.y + portCenterY
        };
      }
      // General outward port is centered on the right edge
      return {
        x: node.position.x + nodeWidth,
        y: node.position.y + 60
      };
    }
  };

  // Center pan view on existing nodes
  const fitView = () => {
    if (nodes.length === 0) {
      setPanOffset({ x: 100, y: 80 });
      setZoom(0.95);
      return;
    }
    
    // Compute bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(n => {
      minX = Math.min(minX, n.position.x);
      minY = Math.min(minY, n.position.y);
      maxX = Math.max(maxX, n.position.x + nodeWidth);
      maxY = Math.max(maxY, n.position.y + nodeHeight);
    });

    if (containerRef.current) {
      const containerW = containerRef.current.clientWidth;
      const containerH = containerRef.current.clientHeight;

      const padding = 100;
      const contentW = maxX - minX;
      const contentH = maxY - minY;

      const zoomX = (containerW - padding * 2) / contentW;
      const zoomY = (containerH - padding * 2) / contentH;
      const newZoom = Math.max(0.6, Math.min(1.1, Math.min(zoomX, zoomY)));

      setZoom(newZoom);
      setPanOffset({
        x: (containerW - contentW * newZoom) / 2 - minX * newZoom,
        y: (containerH - contentH * newZoom) / 2 - minY * newZoom
      });
    }
  };

  // Trigger fit view on mount when nodes loaded
  useEffect(() => {
    setTimeout(fitView, 100);
  }, [nodes.length === 0]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className={`flex-1 relative bg-[#fafafa] overflow-hidden select-none outline-none ${
        activeTool === 'hand'
          ? isPanning ? 'cursor-grabbing' : 'cursor-grab'
          : 'cursor-default'
      }`}
      style={{
        backgroundImage: 'radial-gradient(#dfdfdf 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        backgroundPosition: `${panOffset.x}px ${panOffset.y}px`
      }}
    >
      {/* 1. Canvas World Group (pans and zooms everything) */}
      <div
        className="absolute inset-0 origin-top-left pointer-events-none"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transition: isPanning || draggedNodeId ? 'none' : 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}
      >
        {/* Connection Layer (SVG wires) */}
        <svg className="absolute overflow-visible w-1 h-1 pointer-events-none z-0">
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#b5b5b5" />
            </marker>
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#1ea64a" />
            </marker>
            <marker
              id="arrow-selected"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#3b82f6" />
            </marker>
          </defs>

          {/* Render Connections */}
          {connections.map((conn) => {
            const sourceNode = nodes.find(n => n.id === conn.sourceId);
            const targetNode = nodes.find(n => n.id === conn.targetId);
            if (!sourceNode || !targetNode) return null;

            // Handle logic split multiple outputs
            const { condIndex, totalConds } = getConnectionPortDetails(conn, sourceNode);

            const from = getPortCoordinates(conn.sourceId, 'out', condIndex, totalConds);
            const to = getPortCoordinates(conn.targetId, 'in');

            // Draw a gorgeous cubic bezier curve
            const controlPointOffset = Math.min(100, Math.max(50, Math.abs(to.x - from.x) * 0.4));
            const pathD = `M ${from.x} ${from.y} C ${from.x + controlPointOffset} ${from.y}, ${to.x - controlPointOffset} ${to.y}, ${to.x} ${to.y}`;

            const isConnectionActive = activeNodeId === conn.sourceId;
            const isSelected = selectedConnectionId === conn.id;

            return (
              <g key={conn.id}>
                {/* Visual line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isSelected ? '#3b82f6' : (isConnectionActive ? '#1ea64a' : '#dfdfdf')}
                  strokeWidth={isSelected ? 4 : (isConnectionActive ? 3.5 : 2)}
                  className={isConnectionActive ? 'stroke-dash-active' : ''}
                  markerEnd={isSelected ? "url(#arrow-selected)" : (isConnectionActive ? "url(#arrow-active)" : "url(#arrow)")}
                  style={{
                    strokeDasharray: isConnectionActive ? '6,6' : 'none',
                    transition: 'stroke 0.2s, stroke-width 0.2s'
                  }}
                />

                {/* Invisible wider path for easier clicking */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={15}
                  className="cursor-pointer pointer-events-auto"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedConnectionId(conn.id);
                    onSelectNode(null); // Clear selected node
                  }}
                />
                
                {/* Connector text badge (e.g. branch match value) */}
                {conn.label && (
                  <foreignObject
                    x={(from.x + to.x) / 2 - 40}
                    y={(from.y + to.y) / 2 - 10}
                    width={80}
                    height={20}
                  >
                    <div className="bg-white border border-neutral-200 rounded-full px-2 py-0.5 text-[9px] font-mono text-center text-neutral-400 truncate shadow-xs">
                      {conn.label}
                    </div>
                  </foreignObject>
                )}

              </g>
            );
          })}

          {/* Render drawing connection preview */}
          {drawingConnection && (
            <path
              d={`M ${drawingConnection.startX} ${drawingConnection.startY} C ${drawingConnection.startX + Math.min(100, Math.max(50, Math.abs(drawingConnection.currentX - drawingConnection.startX) * 0.4))} ${drawingConnection.startY}, ${drawingConnection.currentX - Math.min(100, Math.max(50, Math.abs(drawingConnection.currentX - drawingConnection.startX) * 0.4))} ${drawingConnection.currentY}, ${drawingConnection.currentX} ${drawingConnection.currentY}`}
              fill="none"
              stroke="#1ea64a"
              strokeWidth={3}
              strokeDasharray="6,6"
              className="stroke-dash-active"
            />
          )}
        </svg>

        {/* Connection Delete Buttons Overlay */}
        <div className="absolute inset-0 pointer-events-none z-30">
          {connections.map((conn) => {
            if (selectedConnectionId !== conn.id) return null;
            const sourceNode = nodes.find(n => n.id === conn.sourceId);
            const targetNode = nodes.find(n => n.id === conn.targetId);
            if (!sourceNode || !targetNode) return null;

            // Handle logic split multiple outputs
            const { condIndex, totalConds } = getConnectionPortDetails(conn, sourceNode);

            const from = getPortCoordinates(conn.sourceId, 'out', condIndex, totalConds);
            const to = getPortCoordinates(conn.targetId, 'in');

            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;

            return (
              <div
                key={`del-${conn.id}`}
                className="absolute pointer-events-auto"
                style={{
                  left: `${midX}px`,
                  top: `${midY}px`,
                  transform: 'translate(-50%, -50%)',
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConnection(conn.id);
                  }}
                  className="h-7 w-7 rounded-full bg-rose-500 hover:bg-rose-600 active:scale-95 text-white flex items-center justify-center shadow-lg border border-rose-600 transition-all cursor-pointer"
                  title="Delete Connection"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Nodes Layer */}
        <div className="absolute inset-0 pointer-events-none">
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isActive = activeNodeId === node.id;
            const { headerBg, iconBg, icon: Icon } = getNodeColorTheme(node.type);

            return (
              <div
                key={node.id}
                data-node-id={node.id}
                className={`workflow-node-card absolute pointer-events-auto w-[240px] bg-white rounded-2xl border text-left shadow-md flex flex-col transition-shadow ${
                  isSelected ? 'border-black ring-1 ring-black shadow-lg z-25' : 'border-[#dfdfdf] z-10 hover:shadow-md'
                } ${
                  isActive ? 'ring-3 ring-emerald-400 shadow-xl border-emerald-500 animate-pulse' : ''
                }`}
                style={{
                  transform: `translate(${node.position.x}px, ${node.position.y}px)`,
                  cursor: activeTool === 'hand' ? 'inherit' : 'move'
                }}
              >
                {/* Node Card Header */}
                <div className={`p-3 rounded-t-2xl flex items-center justify-between text-white ${headerBg}`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`p-1 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[12px] font-semibold tracking-tight truncate leading-tight">
                      {node.data.title}
                    </span>
                  </div>
                  {/* Small circle active heartbeat indicator */}
                  {isActive && (
                    <div className="h-2.5 w-2.5 bg-white rounded-full pulse-dot shrink-0" />
                  )}
                </div>

                {/* Node Card Content */}
                <div className="p-3 flex-1 flex flex-col justify-between text-[11px] font-[320] leading-normal text-neutral-600 bg-white rounded-b-2xl border-t border-neutral-100">
                  {node.type === 'note' ? (
                    <div
                      style={{ backgroundColor: node.data.noteColor || '#fef9c3' }}
                      className="p-2.5 rounded-lg border border-yellow-200/50 italic text-neutral-700 min-h-[60px]"
                    >
                      {node.data.noteText || 'Write note rules here...'}
                    </div>
                  ) : node.type === 'logic_split' ? (
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono uppercase text-neutral-400 tracking-wider">Split Engine</span>
                      <div className="space-y-1">
                        {(node.data.conditions || []).map((cond, index) => (
                          <div key={index} className="flex justify-between items-center bg-neutral-50 px-2 py-1 rounded border border-neutral-100 font-mono text-[9px] text-neutral-500">
                            <span className="truncate max-w-[80px]">{cond.variable}</span>
                            <span>{cond.operator === 'equals' ? '==' : cond.operator}</span>
                            <span className="truncate max-w-[50px] font-medium text-black">{cond.value}</span>
                          </div>
                        ))}
                        
                        {/* Default fallback route row */}
                        <div className="flex justify-between items-center bg-neutral-50/50 px-2 py-1 rounded border border-dashed border-neutral-200 font-mono text-[9px] text-neutral-400">
                          <span>Default Fallback</span>
                          <span>route</span>
                        </div>

                        {(!node.data.conditions || node.data.conditions.length === 0) && (
                          <span className="text-neutral-400 italic text-[10px]">No logic branch filters</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="line-clamp-3 text-neutral-500">
                        {node.type === 'conversation' && (node.data.prompt || 'Agent speaks to patient...')}
                        {node.type === 'subagent' && `Delegate context to: ${node.data.subagentId || 'bot'}`}
                        {node.type === 'function' && `Call Webhook: ${node.data.apiUrl ? node.data.apiUrl.replace('https://', '') : 'API route'}`}
                        {node.type === 'call_transfer' && `Transfer: ${node.data.phoneNumber || 'operator'}`}
                        {node.type === 'press_digit' && `Press keypad tone: "${node.data.digit}"`}
                        {node.type === 'in_call_sms' && `Send SMS message: "${node.data.smsMessage || 'Confirmation text'}"`}
                        {node.type === 'extract_variable' && `Extract "{{${node.data.variableName || 'var'}}}"`}
                        {node.type === 'code' && `Run sandbox code: "${node.data.codeSnippet ? node.data.codeSnippet.substring(0, 30) + '...' : 'JS Script'}"`}
                        {node.type === 'ending' && 'Terminate SIP session connection.'}
                      </p>
                    </div>
                  )}

                  {/* Port Connectors */}
                  {/* Left Inward Port */}
                  {node.type !== 'note' && (
                    <div
                      className={`absolute -left-3 top-[55px] h-6 w-6 flex items-center justify-center cursor-crosshair transition-all z-30 pointer-events-auto ${
                        hoveredInputNodeId === node.id ? 'scale-125' : 'hover:scale-110'
                      }`}
                      title="Incoming flow port"
                      data-port-input-node-id={node.id}
                    >
                      <div className={`h-3.5 w-3.5 rounded-full flex items-center justify-center shadow-xs border transition-all ${
                        hoveredInputNodeId === node.id
                          ? 'bg-emerald-500 border-emerald-600 ring-4 ring-emerald-200'
                          : 'bg-neutral-100 border-neutral-300'
                      }`}>
                        <div className={`h-1.5 w-1.5 rounded-full transition-colors ${
                          hoveredInputNodeId === node.id ? 'bg-white' : 'bg-neutral-400'
                        }`} />
                      </div>
                    </div>
                  )}

                  {/* Right Outward Ports */}
                  {node.type !== 'ending' && node.type !== 'note' && (
                    node.type === 'logic_split' ? (
                      // Render multiple ports absolutely positioned for splits
                      <div className="absolute inset-0 pointer-events-none z-30">
                        {Array.from({ length: ((node.data.conditions || []).length + 1) }).map((_, i) => (
                          <div
                            key={i}
                            className="absolute right-0 h-3.5 w-3.5 bg-neutral-100 border border-neutral-300 rounded-full flex items-center justify-center cursor-crosshair hover:bg-neutral-250 hover:scale-110 transition-transform pointer-events-auto"
                            style={{
                              top: `${81 + 26 * i}px`,
                              transform: 'translate(50%, -50%)',
                            }}
                            title={i === (node.data.conditions || []).length ? "Default Fallback Route" : `Outward Branch ${i + 1}`}
                            onMouseDown={(e) => handleStartConnection(e, node.id, i)}
                          >
                            <div className="h-1.5 w-1.5 bg-neutral-400 rounded-full" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Normal right port
                      <div
                        className="absolute -right-3 top-[55px] h-6 w-6 flex items-center justify-center cursor-crosshair hover:scale-110 transition-transform z-30 pointer-events-auto"
                        title="Outgoing flow port"
                        onMouseDown={(e) => handleStartConnection(e, node.id)}
                      >
                        <div className="h-3.5 w-3.5 bg-neutral-100 border border-neutral-300 rounded-full flex items-center justify-center shadow-xs">
                          <div className="h-1.5 w-1.5 bg-neutral-400 rounded-full" />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Floating Canvas HUD controls (Zoom/Tools overlay) */}
      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-white border border-[#dfdfdf] shadow-lg rounded-full px-5 py-2 flex items-center gap-4 z-40 select-none">
        {/* Tool Selectors */}
        <div className="flex items-center gap-1 border-r pr-3 border-neutral-200">
          <button
            onClick={() => setActiveTool('select')}
            className={`p-1.5 rounded-lg transition-colors ${
              activeTool === 'select'
                ? 'bg-neutral-100 text-black'
                : 'text-neutral-400 hover:text-black hover:bg-neutral-50'
            }`}
            title="Selection Pointer (V)"
          >
            <MousePointer className="h-4 w-4" />
          </button>
          <button
            onClick={() => setActiveTool('hand')}
            className={`p-1.5 rounded-lg transition-colors ${
              activeTool === 'hand'
                ? 'bg-neutral-100 text-black'
                : 'text-neutral-400 hover:text-black hover:bg-neutral-50'
            }`}
            title="Pan Canvas (Space+Drag)"
          >
            <Hand className="h-4 w-4" />
          </button>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoom(z => Math.max(0.4, z - 0.1))}
            className="p-1 text-neutral-400 hover:text-black rounded hover:bg-neutral-50"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-[11px] font-mono w-10 text-center font-medium text-neutral-600">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}
            className="p-1 text-neutral-400 hover:text-black rounded hover:bg-neutral-50"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>

        {/* Fit / Recenter */}
        <button
          onClick={fitView}
          className="pl-3 border-l border-neutral-200 text-neutral-400 hover:text-black p-1 transition-colors"
          title="Recenter and Fit View"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {/* Styled css animations injection */}
      <style>{`
        @keyframes stroke-dash-move {
          to {
            stroke-dashoffset: -20;
          }
        }
        .stroke-dash-active {
          animation: stroke-dash-move 0.8s linear infinite;
        }
      `}</style>
    </div>
  );
}
