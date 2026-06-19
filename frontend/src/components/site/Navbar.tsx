import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LayoutDashboard, LogOut, User, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

const brandName = "GAP VoicePilot";

const navItems = [
  { label: "Product", menu: "product" as const },
  { label: "Pricing", to: "/pricing" },
  // { label: "About", to: "/about" },
  { label: "Developers", to: "/sdks" },
  // { label: "Blog", to: "/blog" },
  { label: "Company", menu: "company" as const },
];

const productMega = {
  left: {
    title: "See Pricing",
    to: "/pricing",
    description: `See how ${brandName} helps large support and sales teams automate calls at scale — without losing quality.`,
  },
  columns: [
    {
      heading: "Build",
      items: [
        { label: "Call Transfer", to: "/docs" },
        { label: "Book Appointments", to: "/docs" },
        { label: "Knowledge Base", to: "/docs" },
        { label: "Navigate IVR", to: "/docs" },
      ],
    },
    {
      heading: "Deploy",
      items: [
        { label: "Batch Call", to: "/docs" },
        { label: "Branded Call ID", to: "/docs" },
        { label: "Verified Phone Numbers", to: "/docs" },
      ],
    },
    {
      heading: "Monitor",
      items: [{ label: "Post Call Analysis", to: "/docs" }],
    },
  ],
  cta: "See Pricing",
};

const companyMega = {
  left: {
    title: "About Us",
    to: "/about",
    description: `See how leading teams use ${brandName} to transform customer calls and drive real results.`,
  },
  right: {
    title: "Careers",
    to: "/careers",
    description:
      "Join our growing team and help build the future of voice AI—where every call gets smarter.",
  },
};

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<
    "product" | "company" | null
  >(null);
  const [session, setSession] = useState<Session | null>(null);
  const [activeDesktopMenu, setActiveDesktopMenu] = useState<
    "product" | "company" | null
  >(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setActiveDesktopMenu(null);
  };

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }: { data: { session: Session | null } }) => {
        setSession(session);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        setSession(session);
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full px-6 py-4">
      {/* Background Blur Overlay */}
      <div
        className={`fixed inset-0 -z-10 bg-slate-900/10 backdrop-blur-[8px] transition-opacity duration-300 ${
          activeDesktopMenu ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setActiveDesktopMenu(null)}
      />

      <div className="mx-auto max-w-[1320px]">
        <nav className="relative flex h-14 items-center justify-between bg-white px-6 rounded-2xl transition-all duration-300 ">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group transition-transform duration-300 hover:scale-[1.02]"
          >
            <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-transparent transition-all duration-300 group-hover:shadow-md group-hover:ring-black/10">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-full w-full object-contain p-1.5"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold tracking-tight text-[#000000] leading-none">
                {brandName.split(" ")[0]}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#000000]/40 leading-none mt-0.5">
                {brandName.split(" ")[1]}
              </span>
            </div>
          </Link>

          {/* Center Nav Links */}
          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive = activeDesktopMenu === item.menu;
              if (item.menu === "product") {
                return (
                  <button
                    key={item.label}
                    onClick={() =>
                      setActiveDesktopMenu(isActive ? null : "product")
                    }
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13.5px] font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-[#f7f7f5] text-black"
                        : "text-black hover:bg-[#f7f7f5]"
                    }`}
                  >
                    {item.label}
                    <ChevronDown
                      className={`h-3 w-3 transition-transform duration-300 ${isActive ? "rotate-180 text-black/60" : "text-black/40"}`}
                    />
                  </button>
                );
              }

              if (item.menu === "company") {
                return (
                  <button
                    key={item.label}
                    onClick={() =>
                      setActiveDesktopMenu(isActive ? null : "company")
                    }
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13.5px] font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-[#f7f7f5] text-black"
                        : "text-black hover:bg-[#f7f7f5]"
                    }`}
                  >
                    {item.label}
                    <ChevronDown
                      className={`h-3 w-3 transition-transform duration-300 ${isActive ? "rotate-180 text-black/60" : "text-black/40"}`}
                    />
                  </button>
                );
              }

              return (
                <Link
                  key={item.label}
                  to={item.to ?? "#"}
                  className="inline-flex items-center rounded-full px-3.5 py-1.5 text-[13.5px] font-medium text-black transition-all duration-200 hover:bg-[#f7f7f5]"
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right Buttons */}
          <div className="hidden items-center gap-2 md:flex">
            {!session ? (
              <>
                <Link to="/login" className="rounded-full px-4 py-2 text-[13.5px] font-medium text-black hover:bg-[#f7f7f5] transition-colors">
                  Log in
                </Link>
                <Link
                  to="/contact"
                  className="rounded-full bg-white px-5 py-2 text-[13.5px] font-medium text-black transition-all hover:bg-[#f7f7f5]"
                >
                  Contact Sales
                </Link>
                <Link
                  to="/signup"
                  className="rounded-full bg-black px-6 py-2 text-[13.5px] font-medium text-white transition-all hover:opacity-90 shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                >
                  Try For Free
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/contact"
                  className="rounded-full bg-white px-5 py-2 text-[13.5px] font-medium text-black transition-all hover:bg-[#f7f7f5]"
                >
                  Contact Sales
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full bg-[#f7f7f5] px-4 py-2 text-[13.5px] font-medium text-black transition-all hover:bg-black hover:text-white group/dash"
                >
                  <LayoutDashboard className="h-4 w-4 transition-transform group-hover/dash:rotate-3" />
                  Dashboard
                </Link>
            
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-900 shadow-inner md:hidden transition-all duration-200 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <span className="text-xl font-bold">✕</span>
            ) : (
              <span className="text-2xl font-normal">≡</span>
            )}
          </button>

          {/* Product Dropdown Overlay */}
          {activeDesktopMenu === "product" && (
            <div className="absolute left-1/2 top-[calc(100%+6px)] z-[100] w-[1160px] -translate-x-1/2 animate-in fade-in zoom-in-95 duration-200 rounded-xl bg-white p-2 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2)] ring-1 ring-black/5">
              <div className="grid grid-cols-[320px_1fr_1fr_1fr] min-h-[420px] gap-8 rounded-lg overflow-hidden bg-white p-6">
                {/* Brand Card */}
                <Link
                  to={productMega.left.to}
                  onClick={() => setActiveDesktopMenu(null)}
                  className="relative h-full rounded-2xl bg-[#dceeb1] p-6 text-black flex flex-col justify-between overflow-hidden group/card border border-black/5 transition-transform hover:scale-[1.01]"
                >
                  <div className="relative z-10 flex items-center justify-between">
                    <h3 className="text-2xl font-bold tracking-tight leading-none">
                      {productMega.left.title}
                    </h3>
                    <div className="h-8 w-8 rounded-full border border-black/10 flex items-center justify-center text-sm transition-transform duration-300 group-hover/card:translate-x-1">
                      →
                    </div>
                  </div>
                  <div className="relative z-10">
                    <p className="text-sm font-medium leading-relaxed opacity-80">
                      {productMega.left.description}
                    </p>
                  </div>
                </Link>

                {/* Columns */}
                {productMega.columns.map((column, idx) => (
                  <div key={idx} className="pt-2 px-2">
                    <p
                      className="text-[10px] font-bold uppercase tracking-[0.08em] text-black/30 mb-6 font-mono"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {column.heading}
                    </p>
                    <div className="space-y-3">
                      {column.items.map((item) => (
                        <Link
                          key={item.label}
                          to={item.to}
                          onClick={() => setActiveDesktopMenu(null)}
                          className="group block text-[16px] font-medium text-black transition-all duration-200 hover:text-black/50"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}

                {/* CTA Button */}
                <div className="absolute bottom-8 right-8">
                  <Link
                    to="/pricing"
                    onClick={() => setActiveDesktopMenu(null)}
                    className="group flex h-14 w-[280px] items-center justify-between rounded-full bg-[#f4ecd6] pl-8 pr-3 text-[15px] font-medium text-black transition-all duration-300 hover:scale-[1.02]"
                  >
                    <span>See Pricing</span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/10 text-xl transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Company Dropdown Overlay */}
          {activeDesktopMenu === "company" && (
            <div className="absolute left-1/2 top-[calc(100%+6px)] z-[100] w-[720px] -translate-x-1/2 animate-in fade-in zoom-in-95 duration-200 rounded-xl bg-white p-2 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2)] ring-1 ring-black/5">
              <div className="grid grid-cols-2 gap-4 p-3">
                {/* Primary Card (About Us) */}
                <Link
                  to={companyMega.left.to}
                  onClick={() => setActiveDesktopMenu(null)}
                  className="group/card relative rounded-2xl bg-[#c5b0f4] p-6 text-black min-h-[300px] flex flex-col justify-between transition-all duration-300 border border-black/5 hover:scale-[1.01]"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold tracking-tight leading-none">
                      {companyMega.left.title}
                    </h3>
                    <div className="h-6 w-6 rounded-full border border-black/10 flex items-center justify-center text-[10px] transition-transform duration-300 group-hover/card:translate-x-1">
                      →
                    </div>
                  </div>
                  <p className="text-sm font-medium leading-relaxed opacity-80">
                    {companyMega.left.description}
                  </p>
                </Link>

                {/* Secondary Card (Careers) */}
                <Link
                  to={companyMega.right.to}
                  onClick={() => setActiveDesktopMenu(null)}
                  className="group/card relative rounded-2xl border border-black/10 bg-white p-6 min-h-[300px] flex flex-col transition-all duration-300 hover:border-black/20 hover:scale-[1.01]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-black tracking-tight">
                      {companyMega.right.title}
                    </h3>
                    <div className="text-black/20 text-xl transition-transform duration-300 group-hover/card:translate-x-1">
                      →
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-black/60 font-medium">
                    {companyMega.right.description}
                  </p>
                  <div className="mt-auto pt-6">
                    <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black">
                      JOIN THE TEAM{" "}
                      <span className="transition-transform duration-300 group-hover/card:translate-x-1">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-md pt-24 px-6 pb-6 animate-in fade-in duration-300">
          <div className="mx-auto flex max-w-lg flex-col gap-4 rounded-xl bg-white p-6 shadow-2xl ring-1 ring-black/5 animate-in slide-in-from-bottom-8 duration-500">
            <div className="space-y-2">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="border-b border-slate-50 last:border-none pb-2 last:pb-0"
                >
                  {item.menu ? (
                    <button
                      type="button"
                      onClick={() =>
                        setMobileSection((prev) =>
                          prev === item.menu ? null : item.menu,
                        )
                      }
                      className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-base font-bold text-slate-900 hover:bg-slate-50 transition-colors"
                    >
                      {item.label}
                      <ChevronDown
                        className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${mobileSection === item.menu ? "rotate-180" : ""}`}
                      />
                    </button>
                  ) : (
                    <Link
                      to={item.to ?? "#"}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-xl px-4 py-3 text-base font-bold text-slate-900 hover:bg-slate-50 transition-colors"
                    >
                      {item.label}
                    </Link>
                  )}

                  {item.menu === "product" && mobileSection === "product" && (
                    <div className="mt-2 space-y-4 rounded-2xl bg-slate-50 p-4 animate-in slide-in-from-top-4 duration-300">
                      <div className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white">
                        <p className="text-lg font-bold">
                          {productMega.left.title}
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-blue-50">
                          {productMega.left.description}
                        </p>
                      </div>
                      <div className="grid gap-4 px-1">
                        {productMega.columns.map((col) => (
                          <div key={col.heading}>
                            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-blue-600 mb-2">
                              {col.heading}
                            </p>
                            <div className="grid grid-cols-1 gap-1">
                              {col.items.map((i) => (
                                <Link
                                  key={i.label}
                                  to={i.to}
                                  onClick={() => setMobileOpen(false)}
                                  className="block py-1.5 text-sm font-medium text-slate-600 hover:text-blue-600"
                                >
                                  {i.label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.menu === "company" && mobileSection === "company" && (
                    <div className="mt-2 grid gap-3 rounded-2xl bg-slate-50 p-4 animate-in slide-in-from-top-4 duration-300">
                      <Link
                        to={companyMega.left.to}
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-xl bg-slate-900 p-5 text-white transition-transform active:scale-[0.98]"
                      >
                        <p className="text-base font-bold">
                          {companyMega.left.title}
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-slate-400">
                          {companyMega.left.description}
                        </p>
                      </Link>
                      <Link
                        to={companyMega.right.to}
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-xl border border-slate-200 bg-white p-5 transition-transform active:scale-[0.98]"
                      >
                        <p className="text-base font-bold text-slate-900">
                          {companyMega.right.title}
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-slate-600">
                          {companyMega.right.description}
                        </p>
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-3 pt-4 border-t border-slate-100">
              {!session ? (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex h-12 items-center justify-center rounded-xl text-base font-bold text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/contact"
                    className="flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-base font-bold text-slate-900 shadow-sm hover:bg-slate-50 transition-all"
                  >
                    Contact Sales
                  </Link>
                  <Link
                    to="/signup"
                    className="flex h-14 items-center justify-center rounded-xl bg-slate-900 text-base font-bold text-white shadow-lg hover:bg-slate-800 transition-all active:scale-95"
                  >
                    Try For Free
                  </Link>
                </>
              ) : (
                <>
                  <div className="px-4 py-3 mb-2 rounded-xl bg-slate-50">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Logged in as</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{session.user?.email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex h-14 items-center justify-center gap-3 rounded-xl bg-slate-900 text-base font-bold text-white shadow-lg hover:bg-slate-800 transition-all"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileOpen(false);
                    }}
                    className="flex h-12 items-center justify-center gap-3 rounded-xl border border-red-100 bg-red-50 text-base font-bold text-red-600 transition-all active:scale-95"
                  >
                    <LogOut className="h-5 w-5" />
                    Log out
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
