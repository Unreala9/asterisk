import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState, useEffect, useRef, type ReactNode } from "react"
import * as z from "zod"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  ArrowLeft, Bot, Save, AudioLines, Loader2,
  Globe, Shield, Zap, User, CheckCircle2, Phone,
} from 'lucide-react'

export const Route = createFileRoute('/_authenticated/dashboard/agents/new')({
  component: CreateAgentPage,
  validateSearch: (search: Record<string, unknown>) => ({
    agentId: typeof search.agentId === "string" ? search.agentId : undefined,
  }),
})

const LABEL = "font-mono text-[11px] uppercase tracking-[0.1em] text-[#999999]"
const INPUT = "h-11 bg-[#f7f7f5] border-transparent rounded-[12px] px-4 text-[14px] font-[450] focus:bg-white focus:border-[#e6e6e6] transition-all"
const DESC  = "text-[11px] text-[#999999] font-[320] italic"

const VIBE_OPTIONS = [
  {
    value: "professional" as const,
    label: "Professional & Direct",
    description: "Concise and formal. Best for B2B, legal, or finance.",
  },
  {
    value: "warm" as const,
    label: "Warm & Friendly",
    description: "Empathetic and conversational. Best for healthcare or support.",
  },
  {
    value: "persuasive" as const,
    label: "High-Energy & Persuasive",
    description: "Bold and confident. Best for sales or lead qualification.",
  },
]

const formSchema = z.object({
  // Core
  name: z.string().min(2, { message: "Agent name must be at least 2 characters." }),
  ttsProvider: z.string().default("deepgram"),
  language: z.string({ required_error: "Please select a language." }),
  voice: z.string({ required_error: "Please select a voice profile." }),
  voiceGender: z.string().default("female"),
  allowInterruptions: z.boolean(),
  responseTiming: z.number().min(0).max(5000),

  // Automated Intelligence (7 Essential Details)
  businessName: z.string().min(1, "Business name is required"),
  industry: z.string().min(1, "Industry is required"),
  topServices: z.string().min(1, "Please list your top services"),
  callGoal: z.string().min(1, "Call goal is required"),
  pricingRange: z.string().min(1, "Typical pricing is required"),
  usp: z.string().min(1, "Unique Selling Point is required"),
  faqBarrier: z.string().min(1, "Main customer barrier is required"),
  websiteUrl: z.string().url({ message: "Enter a valid URL including https://" }),

  // Agent DNA
  agentVibe: z.enum(["professional", "warm", "persuasive"]),
  humanFallbackName: z.string().optional(),
  humanFallbackExtension: z.string().optional(),
  // Action Triggers
  collectInfo: z.string().optional(),
  webhookUrl: z.string().url({ message: "Enter a valid URL including https://" }).optional().or(z.literal("")),
  phoneNumberId: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

function CreateAgentPage() {
  const navigate = useNavigate()
  const { agentId } = Route.useSearch()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [availablePhoneNumbers, setAvailablePhoneNumbers] = useState<any[]>([])
  // Prevents the TTS provider useEffect from overriding voice/language on initial load
  const ttsUserChangedRef = useRef(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      ttsProvider: "deepgram",
      voice: "",
      voiceGender: "female",
      allowInterruptions: true,
      responseTiming: 800,
      language: "en-US",
      businessName: "",
      industry: "",
      topServices: "",
      callGoal: "",
      pricingRange: "",
      usp: "",
      faqBarrier: "",
      websiteUrl: "",
      agentVibe: "professional",
      humanFallbackName: "",
      humanFallbackExtension: "",
      collectInfo: "",
      webhookUrl: "",
      phoneNumberId: "none",
    },
  })

  useEffect(() => {
    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsInitialLoading(false);
          return;
        }
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const headers = {
          'Authorization': `Bearer ${session.access_token}`,
          'ngrok-skip-browser-warning': 'true',
        };

        // 1. Workspace setup
        const setupRes = await fetch(`${apiUrl}/api/v1/workspaces/setup`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: session.user.id, email: session.user.email }),
        });
        if (!setupRes.ok) throw new Error("Workspace setup failed");
        const { workspace_id } = await setupRes.json();

        // 2. Fetch available phone numbers
        const pnRes = await fetch(`${apiUrl}/api/v1/workspaces/${workspace_id}/phone-numbers`, { headers });
        if (pnRes.ok) {
          const numbers = await pnRes.json();
          setAvailablePhoneNumbers(numbers);
        }

        // 3. Load agent if editing
        if (agentId) {
          const res = await fetch(`${apiUrl}/api/v1/workspaces/${workspace_id}/agents/${agentId}`, { headers });
          if (!res.ok) throw new Error("Failed to load agent");
          const agent = await res.json();

          const kb = agent.kb_metadata || {};
          // Block the TTS-change useEffect from firing during this reset
          ttsUserChangedRef.current = false;
          form.reset({
            name: agent.name || "",
            ttsProvider: kb.tts_provider || "deepgram",
            voice: agent.voice_id || "",
            voiceGender: kb.voice_gender || "female",
            language: agent.language || "en-US",
            allowInterruptions: agent.interrupt_enabled ?? true,
            responseTiming: kb.vad_latency || 800,
            businessName: kb.business_name || "",
            industry: kb.industry || "",
            topServices: kb.top_services || "",
            pricingRange: kb.pricing_range || "",
            usp: kb.usp || "",
            faqBarrier: kb.faq_barrier || "",
            websiteUrl: agent.kb_source_url || "",
            agentVibe: (kb.agent_vibe as any) || "professional",
            humanFallbackName: kb.human_fallback_name || "",
            humanFallbackExtension: kb.human_fallback_extension || "",
            callGoal: kb.call_goal || "",
            collectInfo: kb.collect_info || "",
            webhookUrl: agent.handoff_webhook_url || "",
            phoneNumberId: agent.phone_number_id || "none",
          });
        }
      } catch (err) {
        console.error("Init error:", err);
        setError(err instanceof Error ? err.message : "Failed to load requirements");
      } finally {
        setIsInitialLoading(false);
      }
    }
    init();
  }, [agentId, form])

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError("Not authenticated. Please log in again.")
        return
      }
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'ngrok-skip-browser-warning': 'true',
      }

      const setupRes = await fetch(`${apiUrl}/api/v1/workspaces/setup`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ user_id: session.user.id, email: session.user.email }),
      })
      if (!setupRes.ok) throw new Error(`Workspace setup failed: ${setupRes.status}`)
      const { workspace_id } = await setupRes.json()

      const agentUrl = agentId
        ? `${apiUrl}/api/v1/workspaces/${workspace_id}/agents/${agentId}`
        : `${apiUrl}/api/v1/workspaces/${workspace_id}/agents`

      const agentRes = await fetch(agentUrl, {
        method: agentId ? 'PATCH' : 'POST',
        headers,
        body: JSON.stringify({
          name: values.name,
          tts_provider: values.ttsProvider,
          voice: values.voice,
          voice_gender: values.voiceGender,
          language: values.language,
          allow_interruptions: values.allowInterruptions,
          vad_latency: values.responseTiming,
          business_name: values.businessName,
          industry: values.industry,
          top_services: values.topServices,
          pricing_range: values.pricingRange,
          usp: values.usp,
          faq_barrier: values.faqBarrier,
          website_url: values.websiteUrl,
          agent_vibe: values.agentVibe,
          human_fallback_name: values.humanFallbackName || "",
          human_fallback_extension: values.humanFallbackExtension || "",
          call_goal: values.callGoal,
          collect_info: values.collectInfo || "",
          webhook_url: values.webhookUrl || "",
          phone_number_id: values.phoneNumberId === "none" ? null : values.phoneNumberId,
        }),
      })
      if (!agentRes.ok) {
        const body = await agentRes.json().catch(() => ({}))
        throw new Error(body.detail || `Server error: ${agentRes.status}`)
      }
      navigate({ to: '/dashboard/agents' })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create agent")
    } finally {
      setIsSubmitting(false)
    }
  }

  const watchedTts = form.watch("ttsProvider");

  // Mark that the user has intentionally changed the TTS provider after initial load
  const handleTtsProviderChange = (value: string) => {
    ttsUserChangedRef.current = true;
    form.setValue("ttsProvider", value);
  };

  useEffect(() => {
    // Only auto-swap voice/language when user manually changes TTS provider
    // Not on initial load (when form is reset from DB data)
    if (!ttsUserChangedRef.current) return;
    if (watchedTts === "sarvam") {
      form.setValue("language", "hi-IN");
      form.setValue("voiceGender", "female");
      form.setValue("voice", "shreya");
    } else {
      form.setValue("language", "en-US");
      form.setValue("voiceGender", "female");
      form.setValue("voice", "aura-asteria-en");
    }
  }, [watchedTts, form]);

  const DEEPGRAM_VOICES = [
    { value: "aura-asteria-en", label: "Asteria — Female, Warm" },
    { value: "aura-luna-en", label: "Luna — Female, Soft" },
    { value: "aura-stella-en", label: "Stella — Female, Bright" },
    { value: "aura-athena-en", label: "Athena — Female, Confident" },
    { value: "aura-hera-en", label: "Hera — Female, Authoritative" },
    { value: "aura-orion-en", label: "Orion — Male, Calm" },
    { value: "aura-arcas-en", label: "Arcas — Male, Deep" },
    { value: "aura-perseus-en", label: "Perseus — Male, Clear" },
    { value: "aura-angus-en", label: "Angus — Male, Clear" },
    { value: "aura-orpheus-en", label: "Orpheus — Male, Clear" },
    { value: "aura-helios-en", label: "Helios — Male, Clear" },
    { value: "aura-zeus-en", label: "Zeus — Male, Powerful" },
  ];

  const SARVAM_VOICES = [
    { value: "shubh", label: "Shubh (Sarvam) — Male, Hindi" },
    { value: "meera", label: "Meera (Sarvam) — Female, Hindi" },
    { value: "shreya", label: "Shreya (Sarvam) — Female, Hindi" },
    { value: "manan", label: "Manan (Sarvam) — Male, Hindi" },
    { value: "ishita", label: "Ishita (Sarvam) — Female, Hindi" },
    { value: "arjun", label: "Arjun (Sarvam) — Male, Hindi" },
  ];

  const filteredVoices = watchedTts === "sarvam" ? SARVAM_VOICES : DEEPGRAM_VOICES;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-2 md:px-5 md:py-3">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <Button variant="ghost" className="h-8 w-8 rounded-full hover:bg-[#f7f7f5] p-0 -ml-2" asChild>
          <Link to="/dashboard/agents">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <Bot className="h-3.5 w-3.5" />
            <span>/ AGENT DIRECTORY / {agentId ? 'EDITOR' : 'CREATOR'}</span>
          </div>
          <h1 className="text-3xl font-display text-foreground">{agentId ? 'Configure Agent' : 'New Agent'}</h1>
          <p className="text-muted-foreground text-sm max-w-2xl font-light italic">
            {agentId ? 'Refine the intelligence, voice profiles, and behavioral properties of your active agent.' : 'Define the voice, instructions, and behavior of your next AI interaction.'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* ── 1. Core Configuration ── */}
          <div className="editorial-card p-5 md:p-6 bg-white space-y-6">
            <SectionHeader
              icon={<AudioLines className="h-5 w-5 text-primary" />}
              title="Core Configuration"
              subtitle="Identity & Basic Behavior"
            />

            <div className="grid gap-5 md:grid-cols-3">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={LABEL}>Internal Persona Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Lead Qualification Expert" className={INPUT} {...field} />
                  </FormControl>
                  <FormDescription className={DESC}>Visible only in administrative view.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="ttsProvider" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={LABEL}>TTS Provider</FormLabel>
                  <Select onValueChange={(v) => { handleTtsProviderChange(v); field.onChange(v); }} value={field.value}>
                    <FormControl>
                      <SelectTrigger className={INPUT}>
                        <SelectValue placeholder="Select TTS Provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-lg border-[#e6e6e6]">
                      <SelectItem value="deepgram">Deepgram Aura</SelectItem>
                      <SelectItem value="sarvam">Sarvam AI</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className={DESC}>The text-to-speech engine to use.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="language" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={LABEL}>Primary Dialect</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className={INPUT}>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-lg border-[#e6e6e6]">
                      <SelectItem value="en-US">English (United States)</SelectItem>
                      <SelectItem value="en-GB">English (United Kingdom)</SelectItem>
                      <SelectItem value="hi-IN">Hindi (India)</SelectItem>
                      <SelectItem value="es-ES">Spanish</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className={DESC}>The primary dialect/accent spoken.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="voice" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={LABEL}>Synthesis Engine</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className={INPUT}>
                        <SelectValue placeholder="Select a voice model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border-hairline shadow-lg">
                      {filteredVoices.map((v) => (
                        <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className={DESC}>The voice profile of the agent.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="voiceGender" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={LABEL}>Voice Gender</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className={INPUT}>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-lg border-[#e6e6e6]">
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className={DESC}>Enforces appropriate gender-specific grammar rules.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="phoneNumberId" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={LABEL}>Inbound Phone Number</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className={INPUT}>
                        <SelectValue placeholder="Link a phone number" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border-hairline shadow-lg">
                      <SelectItem value="none">No number linked</SelectItem>
                      {availablePhoneNumbers.map((pn) => (
                        <SelectItem key={pn.id} value={pn.id}>{pn.phone_number} ({pn.friendly_name || 'Unnamed'})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className={DESC}>Calls to this number trigger this agent.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="responseTiming" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={LABEL}>VAD Latency (ms)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="800"
                      className={INPUT}
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription className={DESC}>Wait time before autonomous reply.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="allowInterruptions" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={LABEL}>Allow Interruptions</FormLabel>
                  <FormControl>
                    <div className="flex h-10 items-center justify-between px-4 rounded-[10px] bg-[#f7f7f5] border border-transparent">
                      <span className="text-[13px] font-medium text-black">
                        {field.value ? "Enabled" : "Disabled"}
                      </span>
                      <Switch checked={field.value} onCheckedChange={field.onChange} className="scale-90" />
                    </div>
                  </FormControl>
                  <FormDescription className={DESC}>Let callers speak mid-sentence.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              
              <div />
            </div>
          </div>

          {/* ── 2. Intelligence Seeding ── */}
          <div className="editorial-card p-5 md:p-6 bg-white space-y-6">
            <SectionHeader
              icon={<Zap className="h-5 w-5 text-primary" />}
              title="Intelligence Seeding"
              subtitle="The 7 Essential Details for High-Performance"
            />

            <div className="grid gap-x-6 gap-y-4 md:grid-cols-3">
              <FormField control={form.control} name="businessName" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={LABEL}>Business Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Acme Dental Clinic" className={INPUT} {...field} />
                  </FormControl>
                  <FormDescription className={DESC}>Name of your company/practice.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="industry" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={LABEL}>Industry / Niche</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Healthcare, Real Estate, SaaS" className={INPUT} {...field} />
                  </FormControl>
                  <FormDescription className={DESC}>Your business vertical or category.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="websiteUrl" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={LABEL}>Website URL</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="https://yourwebsite.com" className={cn(INPUT, "pl-11 border-primary/20 bg-primary/5")} {...field} />
                    </div>
                  </FormControl>
                  <FormDescription className={DESC}>Used to sync knowledge base.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="callGoal" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={LABEL}>The "Ideal Outcome"</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Book a consultation, answer pricing" className={INPUT} {...field} />
                  </FormControl>
                  <FormDescription className={DESC}>Primary objective of each call.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="pricingRange" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={LABEL}>Pricing Framework (Ranges)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Packages typically start at $500" className={INPUT} {...field} />
                  </FormControl>
                  <FormDescription className={DESC}>Standard rates or budget ranges.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="usp" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={LABEL}>The "Secret Sauce" (USP)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. We offer 24/7 post-op support" className={INPUT} {...field} />
                  </FormControl>
                  <FormDescription className={DESC}>What makes your service unique.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="faqBarrier" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={LABEL}>#1 Customer Barrier / FAQ</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Is this covered by insurance?" className={INPUT} {...field} />
                  </FormControl>
                  <FormDescription className={DESC}>Top concern/question from callers.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="topServices" render={({ field }) => (
                <FormItem className="space-y-2 md:col-span-2">
                  <FormLabel className={LABEL}>The "Top 3" Services/Products</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="1. Dental Implants&#10;2. Routine Cleaning&#10;3. Teeth Whitening"
                      className="bg-[#f7f7f5] border-transparent rounded-[10px] min-h-[80px] p-3 text-[13px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className={DESC}>Your main offerings (one per line).</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          {/* ── 3. Agent Persona ── */}
          <div className="editorial-card p-5 md:p-6 bg-white space-y-6">
            <SectionHeader
              icon={<User className="h-5 w-5 text-primary" />}
              title="Agent Persona"
              subtitle="Vibe & Human Fallback"
            />

            <div className="space-y-6">
              <FormField control={form.control} name="agentVibe" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className={LABEL}>Communication Vibe</FormLabel>
                  <FormControl>
                    <div className="grid gap-3 md:grid-cols-3">
                      {VIBE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => field.onChange(opt.value)}
                          className={cn(
                            "relative text-left p-4 rounded-xl border-2 transition-all duration-200 space-y-1",
                            field.value === opt.value
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-hairline bg-canvas-soft hover:border-primary/30 hover:bg-white"
                          )}
                        >
                          {field.value === opt.value && (
                            <CheckCircle2 className="absolute top-3 right-3 h-3.5 w-3.5 text-primary" />
                          )}
                          <p className="text-xs font-bold text-foreground pr-6">{opt.label}</p>
                          <p className="text-[11px] text-muted-foreground font-light leading-snug">{opt.description}</p>
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid gap-x-6 gap-y-4 md:grid-cols-3">
                <FormField control={form.control} name="humanFallbackName" render={({ field }) => (
                  <FormItem className="space-y-2 md:col-span-2">
                    <FormLabel className={LABEL}>Human Fallback — Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Sarah Johnson" className={INPUT} {...field} />
                    </FormControl>
                    <FormDescription className={DESC}>Person/department to route calls to.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="humanFallbackExtension" render={({ field }) => (
                  <FormItem className="space-y-2 md:col-span-1">
                    <FormLabel className={LABEL}>Human Fallback — Extension</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 105" className={INPUT} {...field} />
                    </FormControl>
                    <FormDescription className={DESC}>Phone extension or direct number.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>
          </div>

          {/* ── 4. Action Triggers ── */}
          <div className="editorial-card p-5 md:p-6 bg-white space-y-6">
            <SectionHeader
              icon={<Zap className="h-5 w-5 text-primary" />}
              title="Action Triggers"
              subtitle="Data Collection & Integrations"
            />

            <div className="grid gap-5 md:grid-cols-3">
              <FormField control={form.control} name="collectInfo" render={({ field }) => (
                <FormItem className="space-y-2 md:col-span-1">
                  <FormLabel className={LABEL}>Information to Collect</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Name, Email, Phone number, Reason for calling"
                      className={INPUT}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className={DESC}>
                    Fields the agent must capture.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="webhookUrl" render={({ field }) => (
                <FormItem className="space-y-2 md:col-span-2">
                  <FormLabel className={LABEL}>Data Destination (Webhook URL)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://hooks.zapier.com/..." className={INPUT} {...field} />
                  </FormControl>
                  <FormDescription className={DESC}>
                    POST destination for collected call data (Zapier, Make, n8n).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-hairline">
              <Button
                type="button"
                variant="ghost"
                className="h-10 border border-hairline px-6 text-xs font-bold uppercase tracking-widest rounded-full hover:bg-neutral-50"
                asChild
              >
                <Link to="/dashboard/agents">Discard Draft</Link>
              </Button>
              <div className="flex items-center gap-4">
                {error && <p className="text-sm text-destructive italic font-medium">{error}</p>}
                <Button
                  type="submit"
                  className="h-11 px-8 bg-black text-white hover:bg-black/90 shadow-md text-xs font-bold gap-2 rounded-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isSubmitting ? "Deploying..." : (agentId ? "Save Changes" : "Finalize & Save Agent")}
                </Button>
              </div>
            </div>

          {isInitialLoading && (
            <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Retrieving Neural Config...</p>
            </div>
          )}
        </form>
      </Form>
    </div>
  )
}

function SectionHeader({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 pb-3 border-b border-[#f1f1f1]">
      <div className="h-10 w-10 rounded-full bg-canvas-soft border border-hairline flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="space-y-0.5">
        <h3 className="text-[16px] font-bold text-black">{title}</h3>
        <p className="text-[9px] font-mono text-black/40 uppercase tracking-[0.1em]">{subtitle}</p>
      </div>
    </div>
  )
}
