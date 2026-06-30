import { createFileRoute } from '@tanstack/react-router'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PhoneForwarded, Upload, PlayCircle, Clock } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/dashboard/outbound')({
  component: OutboundPage,
})

function OutboundPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-3 md:px-5 md:py-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#999999]">
          <PhoneForwarded className="h-3.5 w-3.5" />
          <span>Outbound Distribution</span>
        </div>
        <h1 className="text-4xl font-[340] tracking-[-0.03em] text-black md:text-5xl">Outbound Campaigns</h1>
        <p className="max-w-2xl text-[15px] font-[330] leading-relaxed text-black/60">
          Create and manage automated outbound calling campaigns.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Call Action */}
        <div className="flex flex-col rounded-[20px] border border-[#e6e6e6] bg-white p-6 shadow-sm">
          <div className="space-y-1 pb-4 mb-6 border-b border-[#f1f1f1]">
            <h3 className="text-[18px] font-[480] text-black flex items-center gap-2">
              <PhoneForwarded className="h-4 w-4 text-black opacity-60" />
              Quick Call
            </h3>
            <p className="text-[13px] text-black/60 font-[320] leading-relaxed">
              Make a single automated call immediately.
            </p>
          </div>
          <div className="space-y-4 flex-1">
            <div className="space-y-2.5">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-[#999999]">Phone Number</Label>
              <Input placeholder="+91 98765-43210" className="h-10 bg-[#f7f7f5] border-transparent rounded-[12px] px-4 text-[13px] font-[450] focus:bg-white transition-all" />
            </div>
            <div className="space-y-2.5">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-[#999999]">Select Agent</Label>
              <Select>
                <SelectTrigger className="h-10 bg-[#f7f7f5] border-transparent rounded-[12px] px-4 text-[13px] font-[450]">
                  <SelectValue placeholder="Choose an agent" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border-[#e6e6e6]">
                  <SelectItem value="agent1">Sales BDR</SelectItem>
                  <SelectItem value="agent2">Survey Collector</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2.5">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-[#999999]">Context / Custom Data (Optional)</Label>
              <Input placeholder="e.g. Lead's name is John" className="h-10 bg-[#f7f7f5] border-transparent rounded-[12px] px-4 text-[13px] font-[450] focus:bg-white transition-all" />
            </div>
          </div>
          <div className="pt-4 border-t border-[#f1f1f1] mt-6">
            <Button className="w-full h-10 rounded-full bg-black text-white hover:bg-black/90 font-[480] text-[13px] gap-2 flex items-center justify-center border-none">
              <PlayCircle className="h-4 w-4" />
              Start Call Now
            </Button>
          </div>
        </div>

        {/* Batch Campaign */}
        <div className="flex flex-col lg:col-span-2 rounded-[20px] border border-[#e6e6e6] bg-white p-6 shadow-sm">
          <div className="space-y-1 pb-4 mb-6 border-b border-[#f1f1f1]">
            <h3 className="text-[18px] font-[480] text-black flex items-center gap-2">
              <Upload className="h-4 w-4 text-black opacity-60" />
              New Batch Campaign
            </h3>
            <p className="text-[13px] text-black/60 font-[320] leading-relaxed">
              Upload a list of leads to start an automated calling campaign.
            </p>
          </div>
          <div className="space-y-6 flex-1">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2.5">
                <Label className="font-mono text-[10px] uppercase tracking-widest text-[#999999]">Campaign Name</Label>
                <Input placeholder="e.g. Q3 Reactivation" className="h-10 bg-[#f7f7f5] border-transparent rounded-[12px] px-4 text-[13px] font-[450] focus:bg-white transition-all" />
              </div>
              <div className="space-y-2.5">
                <Label className="font-mono text-[10px] uppercase tracking-widest text-[#999999]">Select Agent</Label>
                <Select>
                  <SelectTrigger className="h-10 bg-[#f7f7f5] border-transparent rounded-[12px] px-4 text-[13px] font-[450]">
                    <SelectValue placeholder="Choose an agent" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-[#e6e6e6]">
                    <SelectItem value="agent1">Sales BDR</SelectItem>
                    <SelectItem value="agent2">Survey Collector</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2.5">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-[#999999]">Upload Contact List (CSV)</Label>
              <div className="border border-dashed border-[#e6e6e6] rounded-[16px] p-8 flex flex-col items-center justify-center text-center bg-[#f7f7f5]/30 hover:bg-white hover:border-black/20 transition-all cursor-pointer">
                <div className="h-9 w-9 rounded-full bg-[#f7f7f5] border border-[#e6e6e6] flex items-center justify-center mb-3">
                  <Upload className="h-4 w-4 text-black opacity-60" />
                </div>
                <h4 className="font-bold text-[13px] text-black">Click to upload or drag and drop</h4>
                <p className="text-[11px] text-black/50 mt-1 max-w-[250px] font-[320] leading-relaxed">
                  CSV must include a "phone" column. Optional columns: name, email, company.
                </p>
                <Button variant="outline" size="sm" className="mt-3 h-8 rounded-lg text-[11px] border-[#e6e6e6] hover:bg-[#f7f7f5]">
                  Browse Files
                </Button>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-[#f1f1f1] mt-6 flex justify-between gap-4">
            <Button variant="ghost" className="h-10 rounded-full px-5 text-[12px] font-[480] hover:bg-[#f7f7f5] border border-transparent hover:border-[#e6e6e6] gap-2">
              <Clock className="h-4 w-4" />
              Schedule for Later
            </Button>
            <Button className="h-10 rounded-full px-6 bg-[#c5b0f4] text-black hover:bg-[#c5b0f4]/90 font-[480] text-[13px] gap-2 flex items-center justify-center border-none">
              <PlayCircle className="h-4 w-4" />
              Launch Campaign
            </Button>
          </div>
        </div>
      </div>
      
      {/* Active Campaigns List */}
      <div className="flex flex-col gap-3 mt-6">
        <h3 className="text-[20px] font-[480] text-black tracking-tight">Active & Recent Campaigns</h3>
        <div className="flex flex-col items-center justify-center border border-[#e6e6e6] bg-white rounded-[20px] p-10 text-center shadow-sm">
          <PhoneForwarded className="h-9 w-9 text-black/10 mb-3" />
          <h4 className="text-[15px] font-[480] text-black">No campaigns yet</h4>
          <p className="text-[13px] text-black/60 font-[320] leading-relaxed">
            Start a quick call or launch a batch campaign to see it here.
          </p>
        </div>
      </div>
    </div>
  )
}
