export default function TenantLoading() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <div className="h-7 w-32 rounded bg-slate-200 animate-pulse" />
          <div className="hidden md:flex gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-8 w-20 rounded-md bg-slate-100 animate-pulse" />
            ))}
          </div>
        </div>
      </header>
      <div className="container mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="h-4 w-24 rounded bg-slate-200 animate-pulse mb-3" />
              <div className="h-8 w-16 rounded bg-slate-100 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-100 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-slate-200 animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-slate-100 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
