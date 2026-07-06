import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, Scale, Droplet, Clock } from 'lucide-react';
import type { Recipe } from '@/types';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';

export const RecipeCalculatorPage = () => {
  const [scaleFactor, setScaleFactor] = useState<number>(1);
  const [inputs, setInputs] = useState<Record<number, number>>({});
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);

  const { data: recipes, isLoading } = useQuery<Recipe[]>({
    queryKey: ['recipes'],
    queryFn: async () => {
      const { data } = await api.get('/recipes');
      return data;
    }
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
      <p className="text-muted-foreground">Đang tải công thức...</p>
    </div>
  );

  if (!recipes || recipes.length === 0) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <Calculator size={48} className="text-zinc-300 dark:text-zinc-700" />
      <p className="text-muted-foreground text-lg">Chưa có công thức nào trong hệ thống.</p>
      <p className="text-sm text-zinc-400">Đăng nhập với tài khoản Admin để thêm công thức.</p>
    </div>
  );

  const activeRecipe = recipes.find(r => r.id === selectedRecipeId) || recipes[0];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tính toán pha chế</h1>
        <p className="text-muted-foreground mt-1">Chọn công thức và nhập số lượng để tính toán tự động.</p>

        {/* Recipe Selector */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {recipes.map(recipe => (
            <button
              key={recipe.id}
              onClick={() => { setSelectedRecipeId(recipe.id); setScaleFactor(1); setInputs({}); }}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                activeRecipe.id === recipe.id
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-200 dark:shadow-amber-900/50'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {recipe.name}
            </button>
          ))}
        </div>
      </div>

      <Card className="border-amber-200 dark:border-amber-900/50 shadow-md">
        <CardHeader className="bg-amber-50 dark:bg-amber-950/20 border-b border-amber-100 dark:border-amber-900/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl text-amber-800 dark:text-amber-500">{activeRecipe.name}</CardTitle>
            <div className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-400 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
              <Calculator size={16} />
              Tỷ lệ: {scaleFactor.toFixed(2)}x
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-8">

            {/* Input Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Scale size={20} className="text-amber-600" /> Nhập số lượng mục tiêu
              </h3>
              <p className="text-sm text-muted-foreground -mt-2">
                Nhập số lượng mong muốn để tự động tính toán tỷ lệ các nguyên liệu còn lại.
              </p>

              {activeRecipe.ingredients?.filter(i => i.isInputAllowed).map(ingredient => (
                <div key={ingredient.id} className="space-y-2 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-100 dark:border-zinc-800">
                  <Label htmlFor={`input-${ingredient.id}`} className="text-base">
                    {ingredient.name} <span className="text-muted-foreground font-normal">({ingredient.unit})</span>
                  </Label>
                  <Input
                    id={`input-${ingredient.id}`}
                    type="number"
                    min="0.1"
                    step="0.1"
                    placeholder={`Mặc định: ${ingredient.quantity}`}
                    value={inputs[ingredient.id!] || ''}
                    onChange={(e) => handleInputChange(ingredient.id!, Number(ingredient.quantity), e.target.value)}
                    className="text-lg font-medium bg-white dark:bg-zinc-950"
                  />
                </div>
              ))}

              {(activeRecipe.ingredients?.filter(i => i.isInputAllowed).length || 0) === 0 && (
                <p className="text-sm text-muted-foreground italic bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-700">
                  Công thức này không có nguyên liệu nào được đặt làm đầu vào tính toán.
                </p>
              )}
            </div>

            {/* Result Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Droplet size={20} className="text-blue-500" /> Nguyên liệu cần dùng
              </h3>
              <div className="space-y-2">
                {activeRecipe.ingredients?.map(ingredient => {
                  const qty = Number(ingredient.quantity);
                  const calculated = ingredient.isScalable ? qty * scaleFactor : qty;

                  let display = calculated.toFixed(2);
                  let unit = ingredient.unit;

                  if (ingredient.unit === 'g' && calculated >= 1000) {
                    display = (calculated / 1000).toFixed(2);
                    unit = 'kg';
                  } else if (ingredient.unit === 'ml' && calculated >= 1000) {
                    display = (calculated / 1000).toFixed(2);
                    unit = 'L';
                  }

                  display = parseFloat(display).toString();

                  return (
                    <div key={ingredient.id}
                      className="flex justify-between items-center p-3 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                      <div className="flex items-center gap-2">
                        {!ingredient.isScalable && (
                          <Clock size={14} className="text-muted-foreground flex-shrink-0" title="Không thay đổi theo tỷ lệ" />
                        )}
                        <span className="font-medium">{ingredient.name}</span>
                      </div>
                      <span className="text-lg font-bold text-amber-600 dark:text-amber-500 ml-4">
                        {display} {unit}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Steps */}
          {(activeRecipe.steps?.length || 0) > 0 && (
            <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <h3 className="font-semibold text-lg mb-4">Các bước pha chế</h3>
              <ol className="space-y-3">
                {activeRecipe.steps?.map((step, i) => (
                  <li key={step.id} className="flex gap-3 items-start">
                    <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-sm font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/30 rounded-full border border-amber-200 dark:border-amber-800">
                      {step.stepOrder || i + 1}
                    </span>
                    <span className="text-zinc-700 dark:text-zinc-300 pt-0.5">{step.content}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
