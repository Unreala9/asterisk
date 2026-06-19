import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Bell, 
  Plus, 
  Webhook, 
  Mail, 
  AlertCircle, 
  Trash2, 
  Slack,
  Settings2,
  AudioLines
} from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/dashboard/alerting')({
  component: AlertingPage,
})

const initialRules: any[] = []

function AlertingPage() {
  const [rules] = useState(initialRules)

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-3 md:px-5 md:py-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <Bell className="h-4 w-4" />
            <span>Anomaly Detection</span>
          </div>
          <h1 className="text-5xl font-display text-foreground">Alerting</h1>
          <p className="text-muted-foreground text-lg max-w-2xl font-light">
            Configure rules to get notified about interaction anomalies, latency spikes, and system events.
          </p>
        </div>
        <Button className="h-14 editorial-pill px-8 bg-primary text-primary-foreground hover:bg-primary-active shadow-md shrink-0">
          <Plus className="h-5 w-5 mr-2" />
          Create Rule
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="editorial-card p-8 bg-white space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-hairline">
               <h3 className="text-2xl font-display">Active Rules</h3>
               <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-hairline bg-canvas-soft">{rules.length} Configured</Badge>
            </div>
            
            <div className="space-y-4">
              {rules.length > 0 ? (
                rules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-6 rounded-2xl border border-hairline bg-canvas-soft/30 hover:bg-white hover:shadow-sm transition-all duration-300">
                    <div className="flex items-center gap-6">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${rule.enabled ? 'bg-primary/5 text-primary border border-primary/10' : 'bg-muted-soft/10 text-muted-soft border border-hairline'}`}>
                        <Bell className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-base font-bold text-foreground">{rule.name}</span>
                        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-soft">
                          <span>{rule.trigger}</span>
                          <span className="h-1 w-1 rounded-full bg-hairline" />
                          <span className="flex items-center gap-1.5">
                            {rule.channel === 'Slack' && <Slack className="h-3 w-3" />}
                            {rule.channel === 'Email' && <Mail className="h-3 w-3" />}
                            {rule.channel === 'Webhook' && <Webhook className="h-3 w-3" />}
                            {rule.channel}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <Switch checked={rule.enabled} />
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-canvas-soft">
                        <Trash2 className="h-4 w-4 text-muted-soft" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-canvas-soft flex items-center justify-center">
                    <Bell className="h-8 w-8 text-muted-soft opacity-20" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-display">No Monitoring Rules</h4>
                    <p className="text-sm text-muted-foreground font-light italic">Your system is currently unmonitored. Create a rule to start tracking events.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="editorial-card p-8 bg-white space-y-6">
            <div className="flex items-center gap-2">
               <AlertCircle className="h-5 w-5 text-muted-soft" />
               <h3 className="text-xl font-display">Recent Event Log</h3>
            </div>
            <div className="h-48 flex flex-col items-center justify-center text-center space-y-3 bg-canvas-soft/30 rounded-2xl border border-dashed border-hairline">
              <AudioLines className="h-6 w-6 text-muted-soft opacity-20" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-soft">Historical event log is empty.</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="editorial-card p-8 bg-white space-y-8">
            <div className="space-y-1">
               <h3 className="text-xl font-display">Output Channels</h3>
               <p className="text-xs text-muted-foreground font-light italic">Integrate where your team lives.</p>
            </div>
            
            <div className="space-y-4">
              {[
                { name: 'Slack', icon: Slack, status: 'Not Linked', color: '#4A154B' },
                { name: 'Email', icon: Mail, status: 'Inactive', color: '#292524' },
                { name: 'Webhooks', icon: Webhook, status: 'Not Setup', color: '#292524' },
              ].map((chan, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-hairline hover:bg-canvas-soft/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-white border border-hairline shadow-sm">
                       <chan.icon className="h-5 w-5" style={{ color: chan.color, opacity: 0.6 }} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-foreground">{chan.name}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-soft">{chan.status}</span>
                    </div>
                  </div>
                  <Button variant="ghost" className="h-8 editorial-pill text-[10px] uppercase tracking-widest font-bold hover:bg-white">Configure</Button>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full h-12 editorial-pill border-hairline hover:bg-canvas-soft gap-2 text-xs uppercase tracking-widest font-bold">
              <Plus className="h-4 w-4" />
              Register New Channel
            </Button>
          </div>

          <div className="editorial-card p-8 bg-primary/5 border-primary/10">
             <div className="flex items-start gap-4">
                <Settings2 className="h-6 w-6 text-primary mt-1" />
                <div className="space-y-1">
                   <h4 className="text-sm font-bold uppercase tracking-widest text-primary">Intelligent Routing</h4>
                   <p className="text-xs text-primary/70 font-light leading-relaxed italic">Enable AI-driven alerting to automatically filter false positives based on sentiment and context.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
