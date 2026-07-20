import SystemBackground from "@/components/SystemBackground";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative z-0 min-h-screen bg-[#fafafa] text-zinc-900">
      <SystemBackground />
      <main className="relative z-10">
        {children}
      </main>
    </div>
  );
}
