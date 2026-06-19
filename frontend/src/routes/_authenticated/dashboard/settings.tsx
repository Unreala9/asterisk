import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Settings as SettingsIcon, Sliders, Users, CreditCard, Server, Phone } from "lucide-react";
import { SIPTrunksPage } from "./sip-trunks";
import { DidNumbersPage } from "./did-numbers";

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  component: SettingsPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      tab: (search.tab as string) || "general",
    };
  },
});

function SettingsPage() {
  const { tab } = Route.useSearch();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-3 md:px-5 md:py-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#999999]">
          <Sliders className="h-3.5 w-3.5" />
          <span>System Configuration</span>
        </div>
        <h1 className="text-4xl font-[340] tracking-[-0.03em] text-black md:text-5xl">Settings</h1>
        <p className="text-[#666666] text-[18px] max-w-2xl font-[320] leading-relaxed">
          Manage your workspace identity, SIP trunks, DID routing, team access, and resource allocation.
        </p>
      </div>

      <Tabs defaultValue={tab} className="w-full">
        <TabsList className="inline-flex h-11 items-center justify-center rounded-full bg-[#f1f1f1]/80 backdrop-blur-sm p-1 mb-10 border border-[#e6e6e6]/60 overflow-x-auto max-w-full">
          <TabsTrigger value="general" className="rounded-full px-8 text-[13px] font-[480] text-[#666666] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-[0_2px_10px_rgba(0,0,0,0.08)]">General</TabsTrigger>
          <TabsTrigger value="sip-trunks" className="rounded-full px-8 text-[13px] font-[480] text-[#666666] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-[0_2px_10px_rgba(0,0,0,0.08)]">SIP Trunks</TabsTrigger>
          <TabsTrigger value="did-numbers" className="rounded-full px-8 text-[13px] font-[480] text-[#666666] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-[0_2px_10px_rgba(0,0,0,0.08)]">DID Numbers</TabsTrigger>
          <TabsTrigger value="team" className="rounded-full px-8 text-[13px] font-[480] text-[#666666] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-[0_2px_10px_rgba(0,0,0,0.08)]">Team</TabsTrigger>
          <TabsTrigger value="billing" className="rounded-full px-8 text-[13px] font-[480] text-[#666666] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-[0_2px_10px_rgba(0,0,0,0.08)]">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-8 animate-in fade-in duration-500">
          <div className="bg-white border border-[#e6e6e6] rounded-[24px] overflow-hidden">
            <div className="p-8 border-b border-[#f1f1f1]">
              <div className="flex items-center gap-3 mb-1">
                <SettingsIcon className="h-5 w-5 text-black opacity-60" />
                <h3 className="text-[20px] font-[480] text-black">Workspace Profile</h3>
              </div>
              <p className="text-[14px] text-[#666666] font-[320]">Update your organizational identity and branding.</p>
            </div>
            <div className="p-8 space-y-8 max-w-2xl">
              <div className="space-y-2.5">
                <Label className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#999999]">Workspace Name</Label>
                <Input defaultValue="Metabull Universe" className="h-11 bg-[#f7f7f5] border-transparent rounded-[12px] px-4 text-[14px] font-[450] focus:bg-white transition-all" />
              </div>
              <div className="space-y-2.5">
                <Label className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#999999]">Workspace ID</Label>
                <div className="flex gap-2">
                  <Input
                    value="ws_9823kjsd92"
                    readOnly
                    className="h-11 bg-[#f7f7f5] border-transparent rounded-[12px] px-4 font-mono text-[11px] text-[#666666]"
                  />
                  <Button variant="outline" className="h-11 rounded-[12px] border-[#e6e6e6] hover:bg-[#f7f7f5] text-[12px] font-[480] px-6">
                    Copy
                  </Button>
                </div>
              </div>
              <div className="h-px w-full bg-[#f1f1f1]" />
              <div className="space-y-2.5">
                <Label className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#999999]">Operational Timezone</Label>
                <p className="text-[12px] text-[#999999] font-[320] italic">
                  Used for scheduling automated campaigns and reporting windows.
                </p>
                <Input defaultValue="(GMT+05:30) India Standard Time" className="h-11 bg-[#f7f7f5] border-transparent rounded-[12px] px-4 text-[14px] font-[450]" />
              </div>
            </div>
            <div className="p-8 bg-[#f7f7f5]/30 border-t border-[#f1f1f1]">
              <Button className="h-12 rounded-full px-10 bg-[#c5b0f4] text-black hover:bg-[#c5b0f4]/90 font-[480] text-[14px]">
                Save Changes
              </Button>
            </div>
          </div>

          <div className="bg-[#1f1d3d] border border-black rounded-[24px] overflow-hidden shadow-xl text-white">
            <div className="p-8 border-b border-white/10 bg-white/5">
              <h3 className="text-[18px] font-[480]">System Termination Area</h3>
              <p className="text-[13px] text-white/60 font-[320]">Irreversible actions for this intelligence environment.</p>
            </div>
            <div className="p-8">
              <div className="flex items-center justify-between p-6 rounded-[16px] border border-white/10 bg-white/5">
                <div>
                  <p className="font-[480] text-[15px]">Delete Workspace</p>
                  <p className="text-[13px] text-white/60 font-[320]">Permanently remove all agents, intelligence history, and distribution data.</p>
                </div>
                <Button className="h-10 rounded-full px-8 bg-[#ff3d8b] text-white hover:bg-[#ff3d8b]/90 transition-all font-[480] text-[13px] border-none">
                  Terminate
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sip-trunks" className="space-y-8 animate-in fade-in duration-500">
          <SIPTrunksPage />
        </TabsContent>

        <TabsContent value="did-numbers" className="space-y-8 animate-in fade-in duration-500">
          <DidNumbersPage />
        </TabsContent>

        <TabsContent value="team" className="space-y-8 animate-in fade-in duration-500">
          <div className="bg-white border border-[#e6e6e6] rounded-[24px] p-8 text-center">
            <Users className="h-8 w-8 text-[#999999] mx-auto mb-4" />
            <h3 className="text-[18px] font-[480] text-black mb-1">Team Member Directory</h3>
            <p className="text-[14px] text-[#666666] font-[320] max-w-md mx-auto">
              Configure organizational roles and invite collaborators to manage campaigns and voice flows.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-8 animate-in fade-in duration-500">
          <div className="bg-white border border-[#e6e6e6] rounded-[24px] p-8 text-center">
            <CreditCard className="h-8 w-8 text-[#999999] mx-auto mb-4" />
            <h3 className="text-[18px] font-[480] text-black mb-1">Billing & Usage Controls</h3>
            <p className="text-[14px] text-[#666666] font-[320] max-w-md mx-auto">
              View your active subscription details, manage credits, and download invoices.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
