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
    <div className="max-w-3xl mx-auto space-y-4">
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

      {/* Recipe Selector — horizontal scroll chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        {recipes.map(recipe => (
          <button
            key={recipe.id}
            onClick={() => { setSelectedRecipeId(recipe.id); setScaleFactor(1); setInputs({}); setShowSteps(false); }}
            className={`flex-shrink-0 px-3.5 py-2 rounded-full text-sm font-medium transition-all ${activeRecipe.id === recipe.id
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
            }`}
          >
            {recipe.name}
          </button>
        ))}
      </div>

      {/* Main card */}
      <Card className="border-amber-200 dark:border-amber-900/50 shadow-sm overflow-hidden">
        {/* Recipe name header */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border-b border-amber-100 dark:border-amber-900/50 px-4 py-3">
          <h2 className="text-base sm:text-lg font-bold text-amber-800 dark:text-amber-400">{activeRecipe.name}</h2>
          {activeRecipe.ingredients?.length && (
            <p className="text-xs text-amber-600/70 dark:text-amber-500/70 mt-0.5">{activeRecipe.ingredients.length} nguyên liệu</p>
          )}
        </div>

        <CardContent className="p-4 space-y-5">
          {/* Input section */}
          {inputIngredients.length > 0 ? (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                <Scale size={16} className="text-amber-600" />Nhập số lượng mục tiêu
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {inputIngredients.map(ingredient => (
                  <div key={ingredient.id} className="space-y-1.5 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                    <Label htmlFor={`input-${ingredient.id}`} className="text-sm">
                      {ingredient.name} <span className="text-muted-foreground font-normal text-xs">({ingredient.unit})</span>
                    </Label>
                    <Input
                      id={`input-${ingredient.id}`}
                      type="number"
                      min="0.1"
                      step="0.1"
                      inputMode="decimal"
                      placeholder={`Mặc định: ${ingredient.quantity}`}
                      value={inputs[ingredient.id!] || ''}
                      onChange={e => handleInputChange(ingredient.id!, Number(ingredient.quantity), e.target.value)}
                      className="text-base font-medium bg-white dark:bg-zinc-950 h-10"
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

          {/* Result — ingredient list */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              <Droplet size={16} className="text-blue-500" />Nguyên liệu cần dùng
            </h3>
            <div className="space-y-2">
              {activeRecipe.ingredients?.map(ingredient => {
                const qty = Number(ingredient.quantity);
                const calculated = ingredient.isScalable ? qty * scaleFactor : qty;
                let display = calculated.toFixed(2);
                let unit = ingredient.unit;
                if (ingredient.unit === 'g' && calculated >= 1000) { display = (calculated / 1000).toFixed(2); unit = 'kg'; }
                else if (ingredient.unit === 'ml' && calculated >= 1000) { display = (calculated / 1000).toFixed(2); unit = 'L'; }
                display = parseFloat(display).toString();

                return (
                  <div key={ingredient.id} className="flex justify-between items-center px-3 py-2.5 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2 min-w-0">
                      {!ingredient.isScalable && (
                        <span title="Không thay đổi theo tỷ lệ"><Clock size={12} className="text-muted-foreground flex-shrink-0" /></span>
                      )}
                      <span className="font-medium text-sm truncate">{ingredient.name}</span>
                    </div>
                    <span className="text-base font-bold text-amber-600 dark:text-amber-500 ml-3 flex-shrink-0 tabular-nums">
                      {display} <span className="text-sm">{unit}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Steps collapsible */}
          {hasSteps && (
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="w-full flex items-center justify-between text-sm font-semibold text-zinc-700 dark:text-zinc-300 py-1"
              >
                <span>Các bước pha chế ({activeRecipe.steps!.length} bước)</span>
                {showSteps ? <ChevronUp size={16} className="text-zinc-400" /> : <ChevronDown size={16} className="text-zinc-400" />}
              </button>
              {showSteps && (
                <ol className="mt-3 space-y-2.5">
                  {activeRecipe.steps?.map((step, i) => (
                    <li key={step.id} className="flex gap-3 items-start">
                      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/30 rounded-full border border-amber-200 dark:border-amber-800">
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
