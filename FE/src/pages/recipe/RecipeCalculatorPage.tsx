import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, Scale, Droplet, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import type { Recipe } from '@/types';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';

export const RecipeCalculatorPage = () => {
  const [scaleFactor, setScaleFactor] = useState<number>(1);
  const [inputs, setInputs] = useState<Record<number, number>>({});
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const [showSteps, setShowSteps] = useState(false);

  const { data: recipes, isLoading } = useQuery<Recipe[]>({
    queryKey: ['recipes'],
    queryFn: async () => (await api.get('/recipes')).data,
  });

  const handleInputChange = (ingredientId: number, baseQuantity: number, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setInputs({ ...inputs, [ingredientId]: numValue });
      setScaleFactor(numValue / baseQuantity);
    } else {
      const newInputs = { ...inputs };
      delete newInputs[ingredientId];
      setInputs(newInputs);
      setScaleFactor(1);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-foreground text-sm">Đang tải công thức...</p>
    </div>
  );

  if (!recipes || recipes.length === 0) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-center px-4">
      <Calculator size={40} className="text-zinc-300" />
      <p className="text-muted-foreground">Chưa có công thức nào trong hệ thống.</p>
      <p className="text-sm text-zinc-400">Đăng nhập với tài khoản Admin để thêm công thức.</p>
    </div>
  );

  const activeRecipe = recipes.find(r => r.id === selectedRecipeId) || recipes[0];
  const inputIngredients = activeRecipe.ingredients?.filter(i => i.isInputAllowed) || [];
  const hasSteps = (activeRecipe.steps?.length || 0) > 0;

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Tính Toán Pha Chế</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">Chọn công thức và nhập số lượng để tính tự động.</p>
        </div>
        <div className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 flex-shrink-0">
          <Calculator size={14} />
          {scaleFactor.toFixed(2)}x
        </div>
      </div>

      {/* Recipe Selector — native dropdown, mobile-friendly */}
      <div className="relative">
        <select
          value={activeRecipe.id}
          onChange={e => {
            const id = Number(e.target.value);
            setSelectedRecipeId(id);
            setScaleFactor(1);
            setInputs({});
            setShowSteps(false);
          }}
          className="w-full h-12 appearance-none rounded-xl border-2 border-amber-200 dark:border-amber-900 bg-white dark:bg-zinc-900 px-4 pr-10 text-sm font-semibold text-zinc-800 dark:text-zinc-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors cursor-pointer"
        >
          {recipes.map(recipe => (
            <option key={recipe.id} value={recipe.id}>
              {recipe.name}
            </option>
          ))}
        </select>
        <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600 pointer-events-none" />
      </div>

      {/* Main card — compact for mobile */}
      <Card className="border-amber-200 dark:border-amber-900/50 shadow-sm overflow-hidden">
        {/* Recipe subtitle strip */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border-b border-amber-100 dark:border-amber-900/50 px-4 py-2 flex items-center justify-between">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
            {activeRecipe.ingredients?.length || 0} nguyên liệu
          </p>
          {(activeRecipe as any).category && (
            <span className="text-xs bg-amber-200/60 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
              {(activeRecipe as any).category.name}
            </span>
          )}
        </div>

        <CardContent className="p-3 sm:p-4 space-y-4">
          {/* Input section */}
          {inputIngredients.length > 0 ? (
            <div className="space-y-2">
              <h3 className="font-semibold text-xs uppercase tracking-wide flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                <Scale size={13} className="text-amber-600" />Nhập số lượng mục tiêu
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {inputIngredients.map(ingredient => (
                  <div key={ingredient.id} className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900/50 pl-3 pr-2 py-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                    <Label htmlFor={`input-${ingredient.id}`} className="text-sm font-medium flex-1 truncate">
                      {ingredient.name} <span className="text-muted-foreground font-normal text-xs">({ingredient.unit})</span>
                    </Label>
                    <Input
                      id={`input-${ingredient.id}`}
                      type="number"
                      min="0.1"
                      step="0.1"
                      inputMode="decimal"
                      placeholder={`${ingredient.quantity}`}
                      value={inputs[ingredient.id!] || ''}
                      onChange={e => handleInputChange(ingredient.id!, Number(ingredient.quantity), e.target.value)}
                      className="w-24 text-right text-base font-semibold bg-white dark:bg-zinc-950 h-9 flex-shrink-0 tabular-nums"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-dashed">
              Công thức này chưa đặt nguyên liệu đầu vào. Chỉnh sửa trong trang Quản lý.
            </p>
          )}

          {/* Result — ingredient list compact */}
          <div className="space-y-2">
            <h3 className="font-semibold text-xs uppercase tracking-wide flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
              <Droplet size={13} className="text-blue-500" />Nguyên liệu cần dùng
            </h3>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              {activeRecipe.ingredients?.map(ingredient => {
                const qty = Number(ingredient.quantity);
                const calculated = ingredient.isScalable ? qty * scaleFactor : qty;
                let display = calculated.toFixed(2);
                let unit = ingredient.unit;
                if (ingredient.unit === 'g' && calculated >= 1000) { display = (calculated / 1000).toFixed(2); unit = 'kg'; }
                else if (ingredient.unit === 'ml' && calculated >= 1000) { display = (calculated / 1000).toFixed(2); unit = 'L'; }
                display = parseFloat(display).toString();

                return (
                  <div key={ingredient.id} className="flex justify-between items-center px-3 py-2.5 bg-white dark:bg-zinc-950">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {!ingredient.isScalable && (
                        <span title="Không thay đổi theo tỷ lệ">
                          <Clock size={11} className="text-muted-foreground flex-shrink-0" />
                        </span>
                      )}
                      <span className="font-medium text-sm truncate">{ingredient.name}</span>
                    </div>
                    <span className="text-base font-bold text-amber-600 dark:text-amber-500 ml-3 flex-shrink-0 tabular-nums">
                      {display} <span className="text-xs font-medium text-zinc-500">{unit}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Steps collapsible */}
          {hasSteps && (
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 py-1"
              >
                <span>Các bước pha chế ({activeRecipe.steps!.length} bước)</span>
                {showSteps ? <ChevronUp size={15} className="text-zinc-400" /> : <ChevronDown size={15} className="text-zinc-400" />}
              </button>
              {showSteps && (
                <ol className="mt-3 space-y-2">
                  {activeRecipe.steps?.map((step, i) => (
                    <li key={step.id} className="flex gap-3 items-start">
                      <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/30 rounded-full border border-amber-200 dark:border-amber-800">
                        {step.stepOrder || i + 1}
                      </span>
                      <span className="text-sm text-zinc-600 dark:text-zinc-300 pt-0.5">{step.content}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
