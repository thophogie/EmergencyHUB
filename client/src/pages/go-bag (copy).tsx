import { useLocation } from "wouter";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type GoBagItem = {
  id: number;
  category: string;
  name: string;
  checked: boolean;
};

export default function GoBag() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const { data: items = [], isLoading } = useQuery<GoBagItem[]>({
    queryKey: ["goBagItems"],
    queryFn: async () => {
      const res = await fetch("/api/go-bag-items");
      if (!res.ok) throw new Error("Failed to fetch items");
      return res.json();
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, checked }: { id: number; checked: boolean }) => {
      const res = await fetch(`/api/go-bag-items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checked }),
      });
      if (!res.ok) throw new Error("Failed to update item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goBagItems"] });
    },
  });

  const toggleItem = (id: number, currentChecked: boolean) => {
    toggleMutation.mutate({ id, checked: !currentChecked });
  };

  const progress = items.length > 0 
    ? Math.round((items.filter(i => i.checked).length / items.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto shadow-2xl relative">
      <header className="bg-brand-blue text-white p-4 sticky top-0 z-20 shadow-md flex items-center gap-3">
        <button onClick={() => setLocation("/")} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-display font-bold text-xl tracking-wide uppercase">Go Bag Checklist</h1>
      </header>

      <div className="bg-brand-blue px-6 pb-6 pt-2 rounded-b-3xl shadow-lg z-10">
        <div className="flex justify-between items-end mb-2 text-white">
          <span className="font-bold text-3xl" data-testid="text-progress">{progress}%</span>
          <span className="text-sm opacity-80 mb-1">Preparedness Level</span>
        </div>
        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-brand-yellow transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin"></div>
          </div>
        ) : (
          ["Essentials", "First Aid", "Documents", "Clothing"].map((category) => (
            <div key={category}>
              <h3 className="text-brand-blue font-bold text-sm uppercase tracking-wider mb-2 ml-1">{category}</h3>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {items.filter(i => i.category === category).map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => toggleItem(item.id, item.checked)}
                    className="flex items-center gap-3 p-4 border-b border-slate-100 last:border-0 active:bg-slate-50 transition-colors cursor-pointer"
                    data-testid={`item-${item.id}`}
                  >
                    {item.checked ? (
                      <CheckCircle2 className="text-green-500 shrink-0" fill="currentColor" color="white" size={24} />
                    ) : (
                      <Circle className="text-slate-300 shrink-0" size={24} />
                    )}
                    <span className={`font-medium ${item.checked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
