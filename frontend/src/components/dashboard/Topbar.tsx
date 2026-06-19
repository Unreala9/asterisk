import { Bell, Search, User, LogOut } from "lucide-react";
import { SidebarTrigger } from "../ui/sidebar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/use-notifications";

export function Topbar() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [userInitials, setUserInitials] = useState("U");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

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
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate({ to: "/login" });
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-3 border-b border-[#e6e6e6]/50 bg-white px-4 md:px-6">
      <div className="flex items-center gap-3 md:hidden">
        <SidebarTrigger className="h-9 w-9 rounded-full bg-[#f7f7f5] border border-[#e6e6e6] text-black shadow-sm" />
        <Link to="/dashboard" className="flex items-center">
           <img src="/logo.png" alt="Logo" className="h-7 w-7 object-contain" />
        </Link>
      </div>
      <div className="flex flex-1 items-center gap-3 md:gap-5">
        <div className="flex-1 sm:max-w-md ml-auto group">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999] transition-colors group-focus-within:text-black" />
            <Input
              type="search"
              placeholder="Search intelligence logs..."
              className="h-8 w-full rounded-full border-transparent bg-[#f7f7f5] pl-9 pr-3 text-[12px] focus:border-[#e6e6e6] focus:bg-white focus:ring-0 transition-all duration-200"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 ml-auto sm:ml-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8 rounded-full transition-colors hover:bg-[#f7f7f5]"
              >
                <Bell className="h-4 w-4 text-[#666666]" />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-black border border-white" />
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-[20px] border-[#e6e6e6] shadow-2xl p-0 overflow-hidden">
              <div className="bg-[#f7f7f5]/50 px-4 py-3 border-b border-[#f1f1f1]">
                <h3 className="text-[14px] font-[540]">Intelligence Alerts</h3>
              </div>
              <div className="max-h-[350px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => markAsRead(n.id)}
                      className={`px-4 py-3 border-b border-[#f1f1f1]/50 cursor-pointer transition-colors hover:bg-[#f7f7f5]/30 ${!n.is_read ? 'bg-blue-50/10' : ''}`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className={`text-[13px] font-[540] ${!n.is_read ? 'text-black' : 'text-black/50'}`}>{n.title}</span>
                        {!n.is_read && <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5" />}
                      </div>
                      <p className="text-[12px] font-[330] text-black/60 mt-0.5 leading-tight">{n.message}</p>
                      <span className="text-[10px] font-mono text-black/30 mt-2 block uppercase tracking-wider">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-10 text-center text-[13px] font-[330] text-black/30 italic">
                    No active transmissions in buffer.
                  </div>
                )}
              </div>
              <div className="p-2 border-t border-[#f1f1f1] bg-[#f7f7f5]/30">
                <Button variant="ghost" className="w-full h-8 text-[11px] font-[480] text-black/40 hover:text-black">
                  View Archival Logs
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#e6e6e6] bg-white text-[12px] font-[480] text-black shadow-sm transition-colors hover:bg-[#f7f7f5]">
                {userInitials}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-[16px] border-[#e6e6e6] shadow-xl p-1.5">
              <DropdownMenuLabel className="px-3 py-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-[14px] font-[480] leading-none">{userName}</p>
                  <p className="text-[12px] font-[320] leading-none text-[#666]">{userEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1 bg-[#f1f1f1]" />
              <DropdownMenuItem asChild className="rounded-md py-2 cursor-pointer">
                <Link to="/dashboard/profile">
                  <User className="mr-2.5 h-4 w-4 opacity-60" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 bg-[#f1f1f1]" />
              <DropdownMenuItem 
                onClick={() => setShowLogoutDialog(true)}
                className="rounded-md py-2 cursor-pointer text-[#ff3d8b] focus:text-[#ff3d8b] focus:bg-[#ff3d8b]/5"
              >
                <LogOut className="mr-2.5 h-4 w-4 opacity-60" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="rounded-[24px] border-[#e6e6e6] bg-white max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-[340] tracking-tight">Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription className="text-[15px] font-[330] text-[#666]">
              Are you sure you want to log out of your session? You will need to sign in again to access your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="rounded-full border-[#e6e6e6] font-[330] hover:bg-[#f7f7f5] text-black">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogout}
              className="rounded-full bg-[#ff3d8b] text-white hover:bg-[#ff3d8b]/90 font-[480]"
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
