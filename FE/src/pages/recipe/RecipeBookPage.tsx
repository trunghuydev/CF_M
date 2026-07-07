import  { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, BookOpen } from 'lucide-react';
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
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 pb-1">
        <BookOpen size={22} className="text-amber-600" />
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight">Sổ Công Thức</h1>
          <p className="text-xs text-zinc-400 mt-0.5">{recipes?.length || 0} công thức</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Tìm công thức..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter size={14} className="text-zinc-400 flex-shrink-0" />
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedCategory === null ? 'bg-amber-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200'
            }`}
          >Tất cả</button>
          {categories?.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat.id ? 'bg-amber-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200'
              }`}
            >{cat.name}</button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Notebook Grid */}
      {!isLoading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(recipe => (
            <NotebookCard key={recipe.id} recipe={recipe} categories={categories} />
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16 text-zinc-400">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Chưa có công thức nào</p>
        </div>
      )}
    </div>
  );
};

// ─── Notebook Card — dạng trang sổ tay ────────────────────────────
const NotebookCard = ({ recipe, categories }: { recipe: Recipe; categories?: Category[] }) => {
  const catName = categories?.find(c => c.id === recipe.categoryId)?.name;

  return (
    <div className="relative bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-md transition-shadow">
      {/* Notebook lines decoration — left margin */}
      <div className="absolute left-10 top-0 bottom-0 border-l-2 border-rose-200 dark:border-rose-900/40 pointer-events-none" />
      <div className="absolute left-0 top-0 bottom-0 w-10 bg-rose-50 dark:bg-rose-950/20 pointer-events-none" />

      {/* Spiral holes */}
      <div className="absolute left-2.5 top-0 bottom-0 flex flex-col justify-around items-center pointer-events-none py-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-3 h-3 rounded-full border-2 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900" />
        ))}
      </div>

      {/* Content */}
      <div className="pl-14 pr-4 py-4 space-y-3">
        {/* Title */}
        <div>
          {catName && (
            <span className="text-[10px] uppercase tracking-widest font-bold text-amber-500 dark:text-amber-400">{catName}</span>
          )}
          <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-100 leading-tight mt-0.5"
              style={{ fontFamily: "'Georgia', serif" }}>
            {recipe.name}
          </h2>
          <div className="mt-1 h-px bg-zinc-200 dark:bg-zinc-700" />
        </div>

        {/* Ingredients — dạng viết tay */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div className="space-y-1">
            {recipe.ingredients.map(ing => (
              <div key={ing.id} className="flex items-baseline gap-2 text-sm leading-snug">
                <span className="text-amber-600 dark:text-amber-400 font-semibold flex-shrink-0 min-w-[52px] text-right tabular-nums">
                  {Number(ing.quantity)}{ing.unit}
                </span>
                <span className="text-zinc-600 dark:text-zinc-300">{ing.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Steps — nếu có */}
        {recipe.steps && recipe.steps.length > 0 && (
          <div className="mt-2 pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-700 space-y-1">
            {recipe.steps.map((step, idx) => (
              <p key={step.id} className="text-xs text-zinc-500 dark:text-zinc-400 leading-snug">
                <span className="text-amber-500 font-bold mr-1">{step.stepOrder || idx + 1}.</span>
                {step.content}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Ruled lines background */}
      <div className="absolute inset-0 pl-10 pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #e4e4e7 27px, #e4e4e7 28px)',
        backgroundPosition: '0 36px',
        opacity: 0.4,
      }} />
    </div>
  );
};
