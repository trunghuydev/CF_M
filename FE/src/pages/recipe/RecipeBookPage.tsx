import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import api from '@/api/axios';
import type { Recipe, Category } from '@/types';

export const RecipeBookPage = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const { data: recipes, isLoading } = useQuery<Recipe[]>({
    queryKey: ['recipes'],
    queryFn: async () => (await api.get('/recipes')).data,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories')).data,
  });

  const filtered = useMemo(() => {
    if (!recipes) return [];
    return recipes.filter(r => {
      const matchName = r.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCategory === null || r.categoryId === selectedCategory;
      return matchName && matchCat;
    });
  }, [recipes, search, selectedCategory]);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <BookOpen size={20} className="text-amber-600 flex-shrink-0" />
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight">Sổ Công Thức</h1>
          <p className="text-xs text-zinc-400">{recipes?.length || 0} công thức</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Tìm công thức..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
        />
      </div>

      {/* Category filter — horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${selectedCategory === null ? 'bg-amber-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}
        >Tất cả</button>
        {categories?.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${selectedCategory === cat.id ? 'bg-amber-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}
          >{cat.name}</button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16 text-zinc-400">
          <BookOpen size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Chưa có công thức nào</p>
        </div>
      )}

      {/* Cards — 1 col mobile, 2 col tablet+ */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(recipe => (
            <NotebookCard key={recipe.id} recipe={recipe} categories={categories} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Notebook Card ───────────────────────────────────────────────────
const NotebookCard = ({ recipe, categories }: { recipe: Recipe; categories?: Category[] }) => {
  const [showSteps, setShowSteps] = useState(false);
  const catName = categories?.find(c => c.id === recipe.categoryId)?.name;
  const hasSteps = (recipe.steps?.length || 0) > 0;

  return (
    <div className="relative bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-md transition-shadow">
      {/* Left margin — notebook style */}
      <div className="absolute left-9 top-0 bottom-0 border-l-2 border-rose-200 dark:border-rose-900/40 pointer-events-none" />
      <div className="absolute left-0 top-0 bottom-0 w-9 bg-rose-50 dark:bg-rose-950/20 pointer-events-none" />

      {/* Spiral holes */}
      <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-around items-center pointer-events-none py-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-2.5 h-2.5 rounded-full border-2 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900" />
        ))}
      </div>

      {/* Ruled lines */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #e4e4e7 27px, #e4e4e7 28px)',
        backgroundPosition: '0 38px',
        opacity: 0.35,
      }} />

      {/* Content */}
      <div className="relative pl-12 pr-3 py-3 space-y-2">
        {catName && <span className="text-[9px] uppercase tracking-widest font-bold text-amber-500">{catName}</span>}
        <h2 className="text-sm sm:text-base font-bold text-zinc-800 dark:text-zinc-100 leading-tight" style={{ fontFamily: "'Georgia', serif" }}>
          {recipe.name}
        </h2>
        <div className="h-px bg-zinc-200 dark:bg-zinc-700" />

        {/* Ingredients */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div className="space-y-1 py-0.5">
            {recipe.ingredients.map(ing => (
              <div key={ing.id} className="flex items-baseline gap-2 text-sm leading-snug">
                <span className="text-amber-600 dark:text-amber-400 font-semibold flex-shrink-0 w-14 text-right tabular-nums text-xs">
                  {Number(ing.quantity)}{ing.unit}
                </span>
                <span className="text-zinc-600 dark:text-zinc-300 text-xs sm:text-sm">{ing.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Steps toggle */}
        {hasSteps && (
          <div>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-semibold py-1"
            >
              {showSteps ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {showSteps ? 'Ẩn các bước' : `Xem ${recipe.steps!.length} bước pha chế`}
            </button>
            {showSteps && (
              <div className="pt-1 border-t border-dashed border-zinc-200 dark:border-zinc-700 space-y-1">
                {recipe.steps!.map((step, idx) => (
                  <p key={step.id} className="text-xs text-zinc-500 dark:text-zinc-400 leading-snug flex gap-1.5">
                    <span className="text-amber-500 font-bold flex-shrink-0">{step.stepOrder || idx + 1}.</span>
                    {step.content}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
