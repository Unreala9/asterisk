import { createFileRoute } from '@tanstack/react-router'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Blocks, Key, Webhook } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/dashboard/integrations')({
  component: IntegrationsPage,
})

function IntegrationsPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-3 md:px-5 md:py-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#999999]">
          <Blocks className="h-3.5 w-3.5" />
          <span>Integration Hub</span>
        </div>
        <h1 className="text-4xl font-[340] tracking-[-0.03em] text-black md:text-5xl">Integrations</h1>
        <p className="max-w-2xl text-[15px] font-[330] leading-relaxed text-black/60">
          Connect external systems, manage API keys, and configure webhooks.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* API Keys Card */}
        <div className="flex flex-col rounded-[20px] border border-[#e6e6e6] bg-white p-6 shadow-sm">
          <div className="space-y-1 pb-4 mb-6 border-b border-[#f1f1f1]">
            <h3 className="text-[18px] font-[480] text-black flex items-center gap-2">
              <Key className="h-4 w-4 text-black opacity-60" />
              API Keys
            </h3>
            <p className="text-[13px] text-black/60 font-[320] leading-relaxed">
              Use these keys to authenticate API requests from your application.
            </p>
          </div>
          <div className="space-y-4 flex-1">
            <div className="space-y-2.5">
              <div className="font-mono text-[10px] uppercase tracking-widest text-[#999999]">Secret Key</div>
              <div className="flex gap-2">
                <Input type="password" value="No API key generated" readOnly className="h-10 bg-[#f7f7f5] border-transparent rounded-[12px] px-4 text-[13px] font-[450] focus:bg-white transition-all" />
                <Button variant="outline" className="h-10 rounded-[12px] border-[#e6e6e6] hover:bg-[#f7f7f5] text-[12px] font-[480] px-5">Copy</Button>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-[#f1f1f1] mt-6">
            <Button variant="ghost" className="h-9 rounded-full px-5 text-[12px] font-[480] hover:bg-[#f7f7f5] border border-transparent hover:border-[#e6e6e6]">Generate New Key</Button>
          </div>
        </div>

        {/* Webhooks Card */}
        <div className="flex flex-col rounded-[20px] border border-[#e6e6e6] bg-white p-6 shadow-sm">
          <div className="space-y-1 pb-4 mb-6 border-b border-[#f1f1f1]">
            <h3 className="text-[18px] font-[480] text-black flex items-center gap-2">
              <Webhook className="h-4 w-4 text-black opacity-60" />
              Webhooks
            </h3>
            <p className="text-[13px] text-black/60 font-[320] leading-relaxed">
              Receive real-time updates about call status and transcripts.
            </p>
          </div>
          <div className="space-y-4 flex-1">
            <div className="rounded-[14px] border border-dashed border-[#e6e6e6] p-4 bg-[#f7f7f5]/30">
              <h4 className="text-[13px] font-bold mb-1">No Webhook Configured</h4>
              <p className="text-[11px] text-black/50 mb-3">Add an endpoint to receive real-time updates.</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="h-8 rounded-lg text-[11px] border-[#e6e6e6] hover:bg-[#f7f7f5]">Edit</Button>
                <Button size="sm" variant="outline" className="h-8 rounded-lg text-[11px] border-[#e6e6e6] hover:bg-[#f7f7f5]">Test Ping</Button>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-[#f1f1f1] mt-6">
            <Button variant="ghost" className="h-9 rounded-full px-5 text-[12px] font-[480] hover:bg-[#f7f7f5] border border-transparent hover:border-[#e6e6e6]">Add Endpoint</Button>
          </div>
        </div>

        {/* Third-Party Integrations */}
        <div className="md:col-span-2 flex flex-col rounded-[20px] border border-[#e6e6e6] bg-white p-6 shadow-sm">
          <div className="space-y-1 pb-4 mb-6 border-b border-[#f1f1f1]">
            <h3 className="text-[18px] font-[480] text-black flex items-center gap-2">
              <Blocks className="h-4 w-4 text-black opacity-60" />
              Third-Party Integrations
            </h3>
            <p className="text-[13px] text-black/60 font-[320] leading-relaxed">
              Native integrations with CRMs and external platforms.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {['HubSpot', 'Salesforce', 'Make.com', 'Zapier', 'Slack', 'Zendesk'].map(integration => (
              <div key={integration} className="flex items-center justify-between p-4 rounded-[14px] border border-[#e6e6e6] bg-white hover:border-black transition-colors duration-250">
                <span className="font-medium text-[13px]">{integration}</span>
                <Button variant="outline" size="sm" className="h-8 rounded-lg text-[11px] border-[#e6e6e6] hover:bg-[#f7f7f5]">Connect</Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
