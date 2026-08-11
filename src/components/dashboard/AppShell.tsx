"use client";

import DashboardSidebar from "./DashboardSidebar";

type AppShellProps = {
  children: React.ReactNode;
};

const AppShell = ({children}: AppShellProps) => {
  return (
    <div className="mt-atmosphere relative min-h-screen text-[var(--mt-ink)]">
      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row lg:gap-0">
        <DashboardSidebar />

        <div className="flex min-w-0 flex-1 flex-col p-0 lg:p-4 lg:pl-0">
          <main className="mt-stage relative flex min-h-0 flex-1 flex-col overflow-hidden lg:min-h-[calc(100vh-2rem)] lg:rounded-sm">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--mt-accent)]/35 to-transparent" />
            <div className="relative flex min-h-full flex-1 flex-col">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppShell;
