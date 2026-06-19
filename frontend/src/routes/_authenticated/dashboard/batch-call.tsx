import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PhoneOutgoing, Plus, Play, Pause, BarChart3, Users, PhoneForwarded } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/dashboard/batch-call')({
  component: BatchCallPage,
})

function BatchCallPage() {
  const [campaigns] = useState<any[]>([])

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-3 py-2 md:px-5 md:py-3">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#999999]">
            <PhoneForwarded className="h-3.5 w-3.5" />
            <span>Mass Distribution</span>
          </div>
          <h1 className="text-[28px] md:text-4xl font-[340] tracking-[-0.03em] text-black">Batch Call</h1>
          <p className="max-w-[760px] text-[13px] md:text-[14px] font-[320] leading-relaxed text-[#666666]">
            Automate outbound call campaigns at scale with high-concurrency voice engines.
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="h-9 shrink-0 rounded-full bg-[#c5b0f4] px-5 text-[13px] font-[480] text-black transition-all duration-200 hover:bg-[#c5b0f4]/90">
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] rounded-[32px] border-[#e6e6e6] p-8 shadow-2xl">
            <DialogHeader className="space-y-4 text-center">
              <DialogTitle className="text-[28px] font-[340] tracking-tight">Create Campaign</DialogTitle>
              <DialogDescription className="text-[#666666] font-[320] text-[15px]">
                Configure your campaign parameters and upload your contact list.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-mono uppercase tracking-widest text-[#999999]">Campaign Name</Label>
                  <Input placeholder="e.g. Summer Sales" className="h-11 bg-[#f7f7f5] border-transparent rounded-lg px-4 text-[14px] focus:bg-white transition-all" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-mono uppercase tracking-widest text-[#999999]">AI Agent</Label>
                  <Select>
                    <SelectTrigger className="h-11 bg-[#f7f7f5] border-transparent rounded-lg px-4 text-[14px]">
                      <SelectValue placeholder="Choose agent" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-[#e6e6e6]">
                      <SelectItem value="sales">Sales BDR</SelectItem>
                      <SelectItem value="survey">Survey Bot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[11px] font-mono uppercase tracking-widest text-[#999999]">Contacts (CSV)</Label>
                <div className="flex flex-col items-center justify-center border border-dashed border-[#e6e6e6] rounded-[16px] p-8 bg-[#f7f7f5]/50 hover:bg-white hover:border-black/20 transition-all cursor-pointer">
                  <PhoneOutgoing className="h-8 w-8 text-[#999999] mb-3" />
                  <p className="text-[13px] text-black font-[450]">Drop your CSV file here</p>
                  <p className="text-[11px] text-[#999999] font-[320] mt-1 italic">Expected columns: Name, Phone</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-mono uppercase tracking-widest text-[#999999]">Concurrency</Label>
                  <Select defaultValue="5">
                    <SelectTrigger className="h-11 bg-[#f7f7f5] border-transparent rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-[#e6e6e6]">
                      <SelectItem value="5">5 (Standard)</SelectItem>
                      <SelectItem value="20">20 (High Volume)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-mono uppercase tracking-widest text-[#999999]">Start Time</Label>
                  <Select defaultValue="now">
                    <SelectTrigger className="h-11 bg-[#f7f7f5] border-transparent rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-[#e6e6e6]">
                      <SelectItem value="now">Immediate</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full h-12 rounded-full bg-[#c5b0f4] text-black hover:bg-[#c5b0f4]/90 text-[14px] font-[480]">
                Launch Campaign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
        <div className="space-y-1.5 rounded-[16px] border border-[#e6e6e6] bg-[#f7f7f5] p-4 shadow-sm">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#999999]">Active Channels</p>
          <div className="text-[24px] font-[450] text-black">0 / 20</div>
          <p className="font-mono text-[9px] uppercase tracking-tight italic text-[#1ea64a]">20 slots available</p>
        </div>
        <div className="space-y-1.5 rounded-[16px] border border-[#e6e6e6] bg-[#f4ecd6] p-4 text-black shadow-sm">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] opacity-40">Total Reach</p>
          <div className="text-[24px] font-[450]">0</div>
          <div className="flex items-center gap-1.5 font-mono text-[9px] opacity-40">
            <Users className="h-3 w-3" />
            <span>Across 0 campaigns</span>
          </div>
        </div>
        <div className="space-y-1.5 rounded-[16px] border border-[#e6e6e6] bg-[#f7f7f5] p-4 shadow-sm">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#999999]">Connection Rate</p>
          <div className="text-[24px] font-[450] text-black">0%</div>
          <p className="font-mono text-[9px] uppercase tracking-tight italic text-[#999999]">No data yet</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[16px] border border-[#e6e6e6] bg-white shadow-sm">
        <div className="border-b border-black/5 bg-[#c5b0f4] p-4 text-black">
          <h3 className="text-[16px] font-[480] tracking-tight">Active Distribution Campaigns</h3>
          <p className="text-[12px] font-[320] text-black/60">Monitor and control your automated outbound efforts in real-time.</p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#f7f7f5]/50">
              <TableRow className="border-b border-[#f1f1f1] hover:bg-transparent">
                <TableHead className="px-4 py-2 font-mono text-[9px] uppercase tracking-[0.16em]">Campaign Name</TableHead>
                <TableHead className="py-2 font-mono text-[9px] uppercase tracking-[0.16em]">Agent</TableHead>
                <TableHead className="py-2 font-mono text-[9px] uppercase tracking-[0.16em]">Status</TableHead>
                <TableHead className="w-[180px] py-2 font-mono text-[9px] uppercase tracking-[0.16em]">Progress</TableHead>
                <TableHead className="py-2 font-mono text-[9px] uppercase tracking-[0.16em]">Conversion</TableHead>
                <TableHead className="px-4 py-2 text-right font-mono text-[9px] uppercase tracking-[0.16em]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.length > 0 ? (
                campaigns.map((camp) => (
                    <TableRow key={camp.id} className="border-b border-[#f1f1f1] hover:bg-[#f7f7f5]/20">
                      <TableCell className="px-4 py-2">
                        <div className="flex flex-col">
                          <span className="font-[480] text-black">{camp.name}</span>
                          <span className="text-[10px] text-[#999999] font-mono uppercase">{camp.id}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[#666666] text-[13px]">{camp.agent}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-sm text-[10px] font-mono uppercase tracking-wider ${
                        camp.status === 'Running' ? 'bg-[#dceeb1] text-[#1ea64a]' : 'bg-[#f7f7f5] text-[#999999]'
                      }`}>
                        {camp.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-[10px] text-[#999999] font-mono">
                          <span>{camp.completed} / {camp.total}</span>
                          <span>{camp.progress}%</span>
                        </div>
                        <Progress value={camp.progress} className="h-1 bg-[#f1f1f1]" />
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-[13px] text-black">{camp.conversion}</TableCell>
                    <TableCell className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-[#f7f7f5]">
                          {camp.status === 'Running' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-[#f7f7f5]">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="h-32 px-6 text-center text-[14px] font-[320] italic text-[#999999]">
                    No campaigns found. Create one to start calling.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}


