import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Coffee, ChevronDown, ChevronUp, BookOpen, Filter } from 'lucide-react';
import api from '@/api/axios';
import type { Recipe, Category } from '@/types';

export const RecipeBookPage = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

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

  const getCategoryName = (id?: number) =>
    categories?.find(c => c.id === id)?.name;

  const categoryColors: Record<number, string> = {};
  const palette = [
    'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
    'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
    'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400',
    'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400',
    'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400',
  ];
  categories?.forEach((c, i) => { categoryColors[c.id] = palette[i % palette.length]; });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 dark:bg-amber-950/50 text-amber-600 rounded-2xl mb-4">
          <BookOpen size={28} />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Sổ Công Thức</h1>
        <p className="text-muted-foreground mt-2 text-base">
          Tổng hợp {recipes?.length || 0} công thức pha chế nội bộ
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Tìm công thức..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={16} className="text-zinc-400 flex-shrink-0" />
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedCategory === null
                ? 'bg-amber-600 text-white shadow-md shadow-amber-200/50 dark:shadow-amber-900/50'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            Tất cả
          </button>
          {categories?.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-200/50'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {search && (
        <p className="text-sm text-muted-foreground">
          Tìm thấy <strong>{filtered.length}</strong> công thức cho "<strong>{search}</strong>"
        </p>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Đang tải công thức...</p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-20">
          <Coffee size={48} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
          <p className="text-muted-foreground text-lg">
            {search ? `Không tìm thấy công thức nào với từ khóa "${search}"` : 'Chưa có công thức nào.'}
          </p>
        </div>
      )}

      {/* Recipe Cards — Blog style */}
      <div className="space-y-4">
        {filtered.map(recipe => {
          const isExpanded = expandedId === recipe.id;
          const catName = getCategoryName(recipe.categoryId);
          const catColor = recipe.categoryId ? categoryColors[recipe.categoryId] : '';

          return (
            <article
              key={recipe.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Card Header — always visible */}
              <button
                className="w-full text-left p-5 flex items-start gap-4"
                onClick={() => setExpandedId(isExpanded ? null : recipe.id)}
              >
                {/* Icon */}
                <div className="flex-shrink-0 w-12 h-12 bg-amber-50 dark:bg-amber-950/30 text-amber-600 rounded-xl flex items-center justify-center text-2xl font-bold">
                  {recipe.name.charAt(0)}
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 leading-tight">{recipe.name}</h2>
                    {isExpanded
                      ? <ChevronUp size={20} className="text-zinc-400 flex-shrink-0 mt-0.5" />
                      : <ChevronDown size={20} className="text-zinc-400 flex-shrink-0 mt-0.5" />
                    }
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {catName && (
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${catColor}`}>
                        {catName}
                      </span>
                    )}
                    <span className="text-xs text-zinc-400">
                      {recipe.ingredients?.length || 0} nguyên liệu · {recipe.steps?.length || 0} bước
                    </span>
                  </div>

                  {/* Preview ingredients when collapsed */}
                  {!isExpanded && (recipe.ingredients?.length || 0) > 0 && (
                    <p className="text-xs text-zinc-400 mt-2 truncate">
                      {recipe.ingredients?.slice(0, 4).map(i => i.name).join(' · ')}
                      {(recipe.ingredients?.length || 0) > 4 ? ' · ...' : ''}
                    </p>
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-zinc-100 dark:border-zinc-800">
                  <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-100 dark:divide-zinc-800">
                    {/* Ingredients */}
                    <div className="p-5">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-3">Nguyên liệu</h3>
                      <div className="space-y-2">
                        {recipe.ingredients?.map(ing => (
                          <div key={ing.id} className="flex items-center justify-between">
                            <span className="text-sm text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                              {ing.name}
                            </span>
                            <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 ml-3 flex-shrink-0">
                              {Number(ing.quantity)} {ing.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Steps */}
                    <div className="p-5">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-3">Cách pha</h3>
                      <ol className="space-y-2.5">
                        {recipe.steps?.map((step, idx) => (
                          <li key={step.id} className="flex gap-3 items-start text-sm">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold mt-0.5">
                              {step.stepOrder || idx + 1}
                            </span>
                            <span className="text-zinc-700 dark:text-zinc-300 leading-snug">{step.content}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};
