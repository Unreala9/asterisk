import { useEffect, useState } from "react";
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { MessageSquare, Search, Filter, Calendar, User, Bot, Clock, ArrowRight, AudioLines, Loader2 } from 'lucide-react'
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute('/_authenticated/dashboard/chat-history')({
  component: ChatHistoryPage,
})

function ChatHistoryPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [authHeaders, setAuthHeaders] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);
  const [inspectingSession, setInspectingSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
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
          body: JSON.stringify({ user_id: session.user.id, email: session.user.email }),
        });
        const { workspace_id } = await setupRes.json();
        setWorkspaceId(workspace_id);
        
        const sessionsRes = await fetch(`${apiUrl}/api/v1/agents/${workspace_id}/sessions`, { headers });
        const data = await sessionsRes.json();
        setSessions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load chat sessions:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [apiUrl]);

  const fetchMessages = async (sessionId: string) => {
    if (!authHeaders) return;
    setLoadingMessages(true);
    setInspectingSession(sessionId);
    try {
      const res = await fetch(`${apiUrl}/api/v1/agents/sessions/${sessionId}/messages`, { headers: authHeaders });
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load messages:", err);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-3 md:px-5 md:py-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>Text Interaction Logs</span>
          </div>
          <h1 className="text-5xl font-display text-foreground">Chat History</h1>
          <p className="text-muted-foreground text-lg max-w-2xl font-light leading-relaxed">
            Archive of text-based intelligence exchanges across web and secondary SMS channels.
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-12 editorial-pill border-hairline hover:bg-canvas-soft gap-2 text-xs uppercase tracking-widest font-bold">
            <Calendar className="h-3.5 w-3.5" />
            Time Range
          </Button>
          <Button variant="outline" className="h-12 editorial-pill border-hairline hover:bg-canvas-soft gap-2 text-xs uppercase tracking-widest font-bold">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </Button>
        </div>
      </div>

      <div className="editorial-card overflow-hidden bg-white">
        <div className="p-8">
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-soft" />
            <Input 
              type="search" 
              placeholder="Search interaction transcripts..." 
              className="h-14 pl-12 bg-canvas-soft border-hairline rounded-2xl text-base focus:ring-1 focus:ring-primary/20" 
            />
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-xs font-bold uppercase tracking-widest text-muted-soft">Retrieving neural logs...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-hairline hover:bg-transparent">
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-4">Participant</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Intelligence Model</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.length > 0 ? (
                    sessions.map((session) => (
                      <TableRow key={session.id} className="group border-b border-hairline hover:bg-canvas-soft/50 transition-colors">
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-bold text-foreground">{session.user_identifier || "Anonymous"}</span>
                            <span className="text-[9px] text-muted-soft font-mono uppercase tracking-widest truncate max-w-[150px]">{session.id}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                             <Bot className="h-3.5 w-3.5 text-primary" />
                             <span className="text-sm font-medium">{session.agent_name || "Agent"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-[9px] font-bold uppercase tracking-widest py-0 h-4 border-0 ${session.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-canvas-soft text-muted-soft'}`}>
                            {session.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button 
                                variant="ghost" 
                                onClick={() => fetchMessages(session.id)}
                                className="h-10 group-hover:bg-white editorial-pill text-[10px] font-bold uppercase tracking-widest gap-2"
                              >
                                Inspect
                                <ArrowRight className="h-3 w-3" />
                              </Button>
                            </SheetTrigger>
                            <SheetContent className="sm:max-w-[550px] rounded-l-3xl border-hairline shadow-2xl p-0">
                              <div className="h-full flex flex-col">
                                 <div className="p-8 border-b border-hairline space-y-4">
                                    <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                                       <MessageSquare className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                       <SheetTitle className="text-3xl font-display">Chat Transcript</SheetTitle>
                                       <SheetDescription className="text-xs uppercase tracking-widest font-bold text-muted-soft italic">
                                         Session ID: {session.id.slice(0, 8).toUpperCase()} • {new Date(session.created_at).toLocaleString()}
                                       </SheetDescription>
                                    </div>
                                 </div>
                                 
                                 <div className="flex-1 p-8 space-y-8 overflow-y-auto bg-canvas-soft/20">
                                   {loadingMessages ? (
                                      <div className="h-full flex flex-col items-center justify-center py-20">
                                         <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
                                      </div>
                                   ) : messages.map((msg, i) => (
                                     <div key={msg.id || i} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                       <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-muted-soft">
                                         {msg.role === 'assistant' ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
                                         <span>{msg.role === 'assistant' ? 'AI AGENT' : 'USER'}</span>
                                         <span>•</span>
                                         <span>{new Date(msg.created_at).toLocaleTimeString()}</span>
                                       </div>
                                       <div className={`
                                         max-w-[85%] rounded-2xl px-5 py-3 text-sm shadow-sm leading-relaxed
                                         ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-white border border-hairline text-foreground'}
                                       `}>
                                         {msg.content}
                                       </div>
                                     </div>
                                   ))}
                                   
                                   {!loadingMessages && messages.length === 0 && (
                                     <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20 opacity-40">
                                        <AudioLines className="h-8 w-8 text-muted-soft" />
                                        <p className="text-xs font-bold uppercase tracking-widest text-muted-soft">No messages in this session.</p>
                                     </div>
                                   )}
                                 </div>
                                 
                                 <div className="p-8 border-t border-hairline bg-white">
                                   <div className="grid grid-cols-2 gap-8">
                                     <div className="space-y-1">
                                       <div className="text-[10px] font-bold uppercase tracking-widest text-muted-soft">Origin</div>
                                       <div className="text-lg font-display text-primary">Web Playground</div>
                                     </div>
                                     <div className="space-y-1 text-right">
                                       <div className="text-[10px] font-bold uppercase tracking-widest text-muted-soft">Status</div>
                                       <div className="text-lg font-display text-foreground">{session.status}</div>
                                     </div>
                                   </div>
                                 </div>
                              </div>
                            </SheetContent>
                          </Sheet>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-64 text-center">
                         <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="h-12 w-12 rounded-full bg-canvas-soft flex items-center justify-center">
                               <MessageSquare className="h-6 w-6 text-muted-soft opacity-40" />
                            </div>
                            <p className="text-muted-foreground font-light italic">No chat interactions recorded in this period.</p>
                         </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

