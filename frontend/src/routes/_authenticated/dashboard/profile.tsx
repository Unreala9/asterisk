import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Shield,
  Activity,
  Calendar,
  MapPin,
  Camera,
  Edit2,
  CheckCircle2,
  Globe,
  Settings2
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [userInitials, setUserInitials] = useState("U");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || "User";
        setUserName(name);
        setUserEmail(user.email || "");
        const initials = name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
        setUserInitials(initials);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* COVER SECTION WITH VIDEO BACKGROUND */}
      <div className="relative h-[320px] w-full overflow-hidden rounded-b-[40px] shadow-2xl">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover brightness-[0.7] saturate-[1.2]"
        >
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_161253_c72b1869-400f-45ed-ac0c-52f68c2ed5bd.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        <div className="absolute bottom-8 left-12 right-12 flex items-end justify-between">
           <div className="flex items-center gap-6">
              <div className="relative group">
                 <div className="h-32 w-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-2xl flex items-center justify-center text-4xl font-[480] text-black">
                    {userInitials}
                 </div>
                 <button className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-white border border-[#e6e6e6] flex items-center justify-center shadow-lg hover:bg-[#f7f7f5] transition-colors group-hover:scale-110">
                    <Camera className="h-4 w-4 text-black opacity-60" />
                 </button>
              </div>
              <div className="pb-2 space-y-1">
                 <div className="flex items-center gap-2">
                    <h1 className="text-4xl font-[340] text-white tracking-tight">{userName}</h1>
                    <CheckCircle2 className="h-5 w-5 text-[#c8e6cd]" fill="currentColor" />
                 </div>
                 <div className="flex items-center gap-4 text-white/70 text-[14px] font-[320]">
                    <span className="flex items-center gap-1.5">
                       <Mail className="h-3.5 w-3.5 opacity-60" />
                       {userEmail}
                    </span>
                    <span className="flex items-center gap-1.5">
                       <MapPin className="h-3.5 w-3.5 opacity-60" />
                       San Francisco, CA
                    </span>
                 </div>
              </div>
           </div>
           <div className="pb-2">
              <Button className="h-11 rounded-full px-8 bg-white/20 backdrop-blur-md border border-white/20 text-white hover:bg-white/30 transition-all font-[480] text-[14px]">
                 <Edit2 className="h-4 w-4 mr-2" />
                 Edit Profile
              </Button>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-6 py-12">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="inline-flex h-11 items-center justify-center rounded-full bg-[#f1f1f1]/80 backdrop-blur-sm p-1 mb-12 border border-[#e6e6e6]/60">
            <TabsTrigger value="overview" className="rounded-full px-10 text-[13px] font-[480] text-[#666666] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-[0_2px_10px_rgba(0,0,0,0.08)]">Overview</TabsTrigger>
            <TabsTrigger value="activity" className="rounded-full px-10 text-[13px] font-[480] text-[#666666] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-[0_2px_10px_rgba(0,0,0,0.08)]">Activity</TabsTrigger>
            <TabsTrigger value="security" className="rounded-full px-10 text-[13px] font-[480] text-[#666666] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-[0_2px_10px_rgba(0,0,0,0.08)]">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="grid grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* LEFT SIDEBAR INFO */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
               <div className="bg-white border border-[#e6e6e6] rounded-[24px] p-8 space-y-8 shadow-sm">
                  <div className="space-y-4">
                     <h3 className="text-[18px] font-[480] text-black tracking-tight">Biography</h3>
                     <p className="text-[14px] text-[#666666] font-[320] leading-relaxed">
                        Technical architect specializing in low-latency voice intelligence systems. Lead developer for the Aura Voice AI initiatives.
                     </p>
                  </div>
                  
                  <div className="space-y-6">
                     <div className="flex items-center gap-4 text-[14px]">
                        <div className="h-10 w-10 rounded-[12px] bg-[#f7f7f5] flex items-center justify-center border border-[#e6e6e6]">
                           <Globe className="h-4 w-4 text-black opacity-60" />
                        </div>
                        <div>
                           <p className="text-[#999999] text-[11px] font-mono uppercase tracking-widest leading-none mb-1">Portfolio</p>
                           <p className="text-black font-[450]">omnidim.ai/vision</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4 text-[14px]">
                        <div className="h-10 w-10 rounded-[12px] bg-[#f7f7f5] flex items-center justify-center border border-[#e6e6e6]">
                           <Calendar className="h-4 w-4 text-black opacity-60" />
                        </div>
                        <div>
                           <p className="text-[#999999] text-[11px] font-mono uppercase tracking-widest leading-none mb-1">Joined</p>
                           <p className="text-black font-[450]">January 2024</p>
                        </div>
                     </div>
                  </div>

                  <div className="pt-4">
                     <div className="p-5 rounded-[20px] bg-[#c5b0f4]/5 border border-[#c5b0f4]/20 space-y-3">
                        <div className="flex items-center gap-2">
                           <Shield className="h-4 w-4 text-[#c5b0f4]" />
                           <span className="text-[13px] font-[480] text-black">System Administrator</span>
                        </div>
                        <p className="text-[12px] text-[#666666] font-[320]">Privileged access to core intelligence telemetry and global agent mandates.</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* RIGHT MAIN CONTENT */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
               <div className="bg-white border border-[#e6e6e6] rounded-[24px] overflow-hidden shadow-sm">
                  <div className="p-8 border-b border-[#f1f1f1] flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Settings2 className="h-5 w-5 text-black opacity-40" />
                        <h3 className="text-[20px] font-[480] text-black">Workspace Identification</h3>
                     </div>
                  </div>
                  <div className="p-8 grid md:grid-cols-2 gap-8">
                     <div className="space-y-2.5">
                        <Label className="font-mono text-[11px] uppercase tracking-widest text-[#999999]">Full Name</Label>
                        <Input value={userName} readOnly className="h-11 bg-[#f7f7f5] border-transparent rounded-[12px] px-4 text-[14px] font-[450]" />
                     </div>
                     <div className="space-y-2.5">
                        <Label className="font-mono text-[11px] uppercase tracking-widest text-[#999999]">Email Address</Label>
                        <Input value={userEmail} readOnly className="h-11 bg-[#f7f7f5] border-transparent rounded-[12px] px-4 text-[14px] font-[450]" />
                     </div>
                     <div className="space-y-2.5">
                        <Label className="font-mono text-[11px] uppercase tracking-widest text-[#999999]">Professional Role</Label>
                        <Input value="Technical Architect" readOnly className="h-11 bg-[#f7f7f5] border-transparent rounded-[12px] px-4 text-[14px] font-[450]" />
                     </div>
                     <div className="space-y-2.5">
                        <Label className="font-mono text-[11px] uppercase tracking-widest text-[#999999]">Primary Language</Label>
                        <Input value="English (Global)" readOnly className="h-11 bg-[#f7f7f5] border-transparent rounded-[12px] px-4 text-[14px] font-[450]" />
                     </div>
                  </div>
               </div>

               <div className="bg-[#1f1d3d] border border-black rounded-[24px] p-8 flex items-center justify-between shadow-xl text-white">
                  <div className="space-y-1">
                     <h4 className="text-[18px] font-[480]">Advance Account Mastery</h4>
                     <p className="text-[13px] text-white/60 font-[320]">Level up your agent infrastructure with tailored enterprise solutions.</p>
                  </div>
                  <Button className="h-11 rounded-full px-8 bg-[#c5b0f4] text-black hover:bg-[#c5b0f4]/90 font-[480] text-[14px] border-none shadow-lg">
                     Explore Enterprise
                  </Button>
               </div>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="bg-white border border-[#e6e6e6] rounded-[24px] p-8 text-center py-24 space-y-4">
                <div className="h-16 w-16 rounded-full bg-[#f7f7f5] flex items-center justify-center mx-auto border border-[#e6e6e6]">
                   <Activity className="h-6 w-6 text-black opacity-20" />
                </div>
                <h3 className="text-[20px] font-[450] text-black">Audit Logs Dormant</h3>
                <p className="text-[#666666] text-[14px] max-w-[320px] mx-auto font-[320]">System activity telemetry is currently being aggregated. Live feed will manifest shortly.</p>
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
