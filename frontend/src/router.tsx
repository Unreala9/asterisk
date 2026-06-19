import { createRouter, useRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { NotFoundPage } from "@/components/ui/404-page-not-found";

function DefaultErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 font-sans">
      <div className="max-w-xl text-center space-y-12">
        <div className="space-y-6">
          <div className="font-mono text-[14px] uppercase tracking-[0.2em] text-black/40">
            / System Exception
          </div>
          <h1 className="text-[48px] font-[340] tracking-tight text-black">Something went wrong</h1>
          <p className="text-[18px] font-[330] text-black/60 leading-relaxed">
            An unexpected error occurred during execution.
          </p>
        </div>
        
        {import.meta.env.DEV && error.message && (
          <pre className="max-h-40 overflow-auto rounded-[12px] bg-[#f7f7f5] border border-[#e6e6e6] p-6 text-left font-mono text-xs text-red-500">
            {error.message}
          </pre>
        )}
        
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="h-14 rounded-full bg-black text-white px-10 text-[18px] font-[480] hover:bg-black/90 transition-all"
          >
            Try again
          </button>
          <a
            href="/"
            className="h-14 rounded-full border border-[#e6e6e6] px-10 text-[18px] font-[480] text-black hover:bg-[#f7f7f5] transition-all flex items-center justify-center"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const getRouter = () => {
  const router = createRouter({
    routeTree,
    context: {},
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultErrorComponent,
    defaultNotFoundComponent: () => <NotFoundPage />,
  });

  return router;
};
