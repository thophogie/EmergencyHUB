import { Header } from "@/components/Header";
import { DashboardGrid } from "@/components/DashboardGrid";
import { BottomNav } from "@/components/BottomNav";

export default function Home() {
  return (
    <div className="min-h-screen bg-brand-blue flex flex-col max-w-md mx-auto shadow-2xl relative">
      <Header />
      
      <main className="flex-1 relative z-10 overflow-y-auto overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch' }}>
        <DashboardGrid />
      </main>

      <BottomNav />
    </div>
  );
}
