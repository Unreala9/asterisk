import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, Clock, Globe, Plus, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

function getDefaultTime() {
  const d = new Date(Date.now() + 5 * 60 * 1000);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function TimePicker({
  value,
  onChange,
  selectedDate,
}: {
  value: string;
  onChange: (t: string) => void;
  selectedDate?: Date;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"hours" | "minutes">("hours");

  const [hStr, mStr] = value.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);

  const now = new Date();
  const isToday = !selectedDate || selectedDate.toDateString() === now.toDateString();
  const nowH = now.getHours();
  const nowM = now.getMinutes();

  useEffect(() => {
    if (open) setMode("hours");
  }, [open]);

  const selectHour = (newH: number) => {
    let newM = m;
    if (isToday && newH === nowH && newM <= nowM) {
      newM = Math.min(nowM + 1, 59);
    }
    onChange(`${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`);
    setTimeout(() => setMode("minutes"), 250);
  };

  const selectMinute = (newM: number) => {
    onChange(`${String(h).padStart(2, "0")}:${String(newM).padStart(2, "0")}`);
  };

  const CLOCK_SIZE = 240;
  const CENTER = CLOCK_SIZE / 2;
  const RADIUS_OUTER = 92;
  const RADIUS_INNER = 56;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full justify-start font-normal rounded-xl border-[#e6e6e6] bg-[#f7f7f5]/30 text-[14px] gap-2"
        >
          <Clock className="h-4 w-4 opacity-40 shrink-0" />
          <span className="font-mono">{value}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-5 rounded-[24px] border-[#e6e6e6] shadow-2xl bg-white flex flex-col items-center gap-5"
        align="start"
        sideOffset={4}
      >
        {/* Header: 12:30 */}
        <div className="flex items-center gap-1 text-4xl font-light">
          <button
            type="button"
            onClick={() => setMode("hours")}
            className={cn(
              "px-3 py-2 rounded-xl transition-all",
              mode === "hours" ? "bg-pink-50 text-pink-600 font-normal" : "text-black/40 hover:bg-gray-50"
            )}
          >
            {String(h).padStart(2, "0")}
          </button>
          <span className="text-black/30 pb-1">:</span>
          <button
            type="button"
            onClick={() => setMode("minutes")}
            className={cn(
              "px-3 py-2 rounded-xl transition-all",
              mode === "minutes" ? "bg-pink-50 text-pink-600 font-normal" : "text-black/40 hover:bg-gray-50"
            )}
          >
            {String(m).padStart(2, "0")}
          </button>
        </div>

        {/* Clock Face */}
        <div
          className="relative rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center select-none"
          style={{ width: CLOCK_SIZE, height: CLOCK_SIZE }}
        >
          {/* Center Dot */}
          <div className="absolute w-2 h-2 bg-pink-500 rounded-full z-20" />

          {/* Clock Hand */}
          {(() => {
            const isInner = mode === "hours" && (h === 0 || h > 12);
            const r = mode === "minutes" ? RADIUS_OUTER : (isInner ? RADIUS_INNER : RADIUS_OUTER);
            const val = mode === "hours" ? h : m;
            const angle = mode === "hours" ? ((val % 12) * 30 - 90) : (val * 6 - 90);

            return (
              <div
                className="absolute origin-left z-0 pointer-events-none transition-all duration-300 ease-in-out"
                style={{
                  width: r,
                  height: 2,
                  backgroundColor: "#ec4899", // pink-500
                  top: CENTER - 1,
                  left: CENTER,
                  transform: `rotate(${angle}deg)`,
                }}
              >
                {/* Hand end circle */}
                <div
                  className="absolute w-8 h-8 rounded-full bg-pink-500"
                  style={{ right: -16, top: 'calc(50% - 16px)' }}
                />
              </div>
            );
          })()}

          {/* Numbers */}
          {mode === "hours" ? (
            Array.from({ length: 24 }).map((_, i) => {
              const hr = i;
              const isInner = hr === 0 || hr > 12;
              const r = isInner ? RADIUS_INNER : RADIUS_OUTER;
              const angle = ((hr % 12) * 30 - 90) * (Math.PI / 180);
              const cx = CENTER + Math.cos(angle) * r;
              const cy = CENTER + Math.sin(angle) * r;
              const past = isToday && hr < nowH;
              const sel = hr === h;

              return (
                <button
                  key={hr}
                  type="button"
                  disabled={past}
                  onClick={() => selectHour(hr)}
                  className={cn(
                    "absolute w-8 h-8 flex items-center justify-center rounded-full text-[14px] transition-colors z-10 -translate-x-1/2 -translate-y-1/2",
                    sel ? "text-white font-medium" : "text-slate-700 hover:bg-slate-200",
                    past && "opacity-20 cursor-not-allowed hover:bg-transparent hover:text-slate-700"
                  )}
                  style={{ left: cx, top: cy }}
                >
                  {hr === 0 ? "00" : hr}
                </button>
              );
            })
          ) : (
            Array.from({ length: 60 }).map((_, i) => {
              const mn = i;
              const angle = (mn * 6 - 90) * (Math.PI / 180);
              const cx = CENTER + Math.cos(angle) * RADIUS_OUTER;
              const cy = CENTER + Math.sin(angle) * RADIUS_OUTER;
              const past = isToday && h === nowH && mn <= nowM;
              const sel = mn === m;
              const is5 = mn % 5 === 0;

              return (
                <button
                  key={mn}
                  type="button"
                  disabled={past}
                  onClick={() => selectMinute(mn)}
                  className={cn(
                    "absolute flex items-center justify-center rounded-full transition-colors z-10 -translate-x-1/2 -translate-y-1/2",
                    is5 ? "w-8 h-8 text-[14px]" : "w-5 h-5",
                    sel ? "text-white font-medium" : "text-slate-700 hover:bg-slate-200",
                    past && "opacity-20 cursor-not-allowed hover:bg-transparent hover:text-slate-700"
                  )}
                  style={{ left: cx, top: cy }}
                >
                  {is5 ? (
                    String(mn).padStart(2, "0")
                  ) : (
                    <div className={cn("w-1 h-1 rounded-full", sel ? "bg-white" : "bg-slate-300")} />
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="w-full pt-1">
          <Button
            type="button"
            className="w-full h-12 rounded-xl bg-black text-white text-[14px] font-medium hover:bg-black/90 shadow-lg shadow-black/5"
            onClick={() => setOpen(false)}
          >
            Set {value}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface ScheduleTaskModalProps {
  workspaceId: string;
  agents: any[];
  onSuccess: () => void;
  authHeaders: any;
}

export function ScheduleTaskModal({ workspaceId, agents, onSuccess, authHeaders }: ScheduleTaskModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState(getDefaultTime);

  const [formData, setFormData] = useState({
    title: "",
    agent_id: "",
    task_type: "voice_call",
    description: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    recurrence: "none",
    recipient_number: "",
  });

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      const now = new Date();
      const isToday = newDate.toDateString() === now.toDateString();
      if (isToday) {
        const [tH, tM] = time.split(":").map(Number);
        if (tH < now.getHours() || (tH === now.getHours() && tM <= now.getMinutes())) {
          setTime(getDefaultTime());
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !formData.agent_id || !formData.title) {
      toast.error("Please fill in all required fields (Title, Agent, and Date)");
      return;
    }

    if (formData.task_type === "voice_call" && !formData.recipient_number.trim()) {
      toast.error("Recipient number is required for voice calls");
      return;
    }

    // Guard against scheduling in the past
    const [hours, minutes] = time.split(":").map(Number);
    const scheduledDate = new Date(date);
    scheduledDate.setHours(hours, minutes, 0, 0);
    if (scheduledDate <= new Date()) {
      toast.error("Scheduled time is in the past. Please pick a future time.");
      return;
    }

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        throw new Error("Authentication session not found. Please log in again.");
      }

      const payload = {
        title: formData.title,
        agent_id: formData.agent_id,
        workspace_id: workspaceId,
        user_id: authData.user.id,
        task_type: formData.task_type,
        description: formData.description,
        scheduled_time_utc: scheduledDate.toISOString(),
        timezone: formData.timezone,
        recurrence_rule: formData.recurrence === "none" ? null : `FREQ=${formData.recurrence.toUpperCase()}`,
        payload: { to: formData.recipient_number },
      };

      const res = await fetch(`${apiUrl}/api/v1/scheduled-tasks`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Task scheduled successfully");
        setOpen(false);
        onSuccess();
        setFormData({
          title: "",
          agent_id: "",
          task_type: "voice_call",
          description: "",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          recurrence: "none",
          recipient_number: "",
        });
        setDate(undefined);
        setTime(getDefaultTime());
      } else {
        const error = await res.json();
        toast.error(error.detail || "Failed to schedule task");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-11 gap-2 rounded-full bg-black px-6 text-[13px] font-medium text-white hover:bg-black/90 transition-all shadow-lg shadow-black/10">
          <Plus className="h-4 w-4" />
          Schedule Task
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-[24px] border-[#e6e6e6] bg-white p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-[24px] font-[340] tracking-tight">Initialize Sequence</DialogTitle>
          <p className="text-[13px] font-[330] text-black/50">Configure a new temporal task for your intelligence agents.</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-5">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-mono uppercase tracking-widest text-black/40">Task Title</Label>
              <Input
                placeholder="e.g., Morning Outreach Call"
                className="h-11 rounded-xl border-[#e6e6e6] bg-[#f7f7f5]/30 focus:border-black focus:ring-0 text-[14px]"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-mono uppercase tracking-widest text-black/40">Intelligence Agent</Label>
                <Select onValueChange={(v) => setFormData({ ...formData, agent_id: v })}>
                  <SelectTrigger className="h-11 rounded-xl border-[#e6e6e6] bg-[#f7f7f5]/30 text-[14px]">
                    <SelectValue placeholder="Select Agent" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-[#e6e6e6]">
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id} className="text-[14px]">
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-mono uppercase tracking-widest text-black/40">Task Type</Label>
                <Select defaultValue="voice_call" onValueChange={(v) => setFormData({ ...formData, task_type: v })}>
                  <SelectTrigger className="h-11 rounded-xl border-[#e6e6e6] bg-[#f7f7f5]/30 text-[14px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-[#e6e6e6]">
                    <SelectItem value="voice_call">Voice Call</SelectItem>
                    <SelectItem value="webhook">Webhook</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-mono uppercase tracking-widest text-black/40">Recipient Number</Label>
              <Input
                placeholder="+91 98765-43210"
                className="h-11 rounded-xl border-[#e6e6e6] bg-[#f7f7f5]/30 focus:border-black focus:ring-0 text-[14px]"
                value={formData.recipient_number}
                onChange={(e) => setFormData({ ...formData, recipient_number: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-mono uppercase tracking-widest text-black/40">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant={"outline"}
                      className={cn(
                        "h-11 w-full justify-start text-left font-normal rounded-xl border-[#e6e6e6] bg-[#f7f7f5]/30",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 opacity-40" />
                      {date ? format(date, "PPP") : <span className="text-[14px]">Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl border-[#e6e6e6]" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateSelect}
                      disabled={(day) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return day < today;
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-mono uppercase tracking-widest text-black/40">Time</Label>
                <TimePicker value={time} onChange={setTime} selectedDate={date} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-mono uppercase tracking-widest text-black/40">Recurrence</Label>
                <Select defaultValue="none" onValueChange={(v) => setFormData({ ...formData, recurrence: v })}>
                  <SelectTrigger className="h-11 rounded-xl border-[#e6e6e6] bg-[#f7f7f5]/30 text-[14px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-[#e6e6e6]">
                    <SelectItem value="none">One-time</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-mono uppercase tracking-widest text-black/40">Timezone</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
                  <Input
                    readOnly
                    className="h-11 rounded-xl border-[#e6e6e6] bg-[#f7f7f5]/20 pl-10 text-[12px] cursor-default"
                    value={formData.timezone}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 h-12 rounded-xl text-[14px] font-medium"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-12 rounded-xl bg-black text-white text-[14px] font-medium hover:bg-black/90 shadow-lg shadow-black/10"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Scheduling...</span>
                </div>
              ) : "Schedule Execution"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
