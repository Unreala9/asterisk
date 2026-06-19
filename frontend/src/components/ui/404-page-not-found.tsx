"use client";

import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <section className="bg-white min-h-screen flex items-center justify-center font-sans overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex justify-center">
          <div className="w-full max-w-4xl text-center space-y-12">
            
            {/* 404 Visual Section */}
            <div
              className="relative bg-[url(https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif)] h-[250px] sm:h-[400px] bg-center bg-no-repeat bg-contain"
              aria-hidden="true"
            >
              <h1 className="text-[120px] sm:text-[180px] font-[340] tracking-[-0.04em] text-black pt-4">
                404
              </h1>
            </div>

            {/* Content Section */}
            <div className="space-y-6 -mt-12 relative z-10">
              <div className="space-y-2">
                <div className="font-mono text-[14px] uppercase tracking-[0.2em] text-black/40">
                  / Navigation Error
                </div>
                <h3 className="text-[32px] sm:text-[48px] font-[340] tracking-tight text-black">
                  Look like you're lost
                </h3>
              </div>
              
              <p className="text-[18px] sm:text-[20px] font-[330] text-black/60 max-w-md mx-auto leading-relaxed">
                The page you are looking for has been decommissioned or moved to a new coordinate.
              </p>

              <div className="pt-8">
                <Button
                  onClick={() => navigate({ to: "/" })}
                  className="h-16 rounded-full px-12 bg-black text-white hover:bg-black/90 transition-all text-[20px] font-[480] shadow-xl shadow-black/5"
                >
                  Return to Base
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
