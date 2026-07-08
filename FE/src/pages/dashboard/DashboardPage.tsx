import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Coffee, Layers, Plus, Pencil, Trash2, X, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/api/axios';
import type { Recipe, Category } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

type IngForm = { name: string; quantity: string; unit: string; isScalable: boolean; isInputAllowed: boolean; displayOrder: number };
type StepForm = { stepOrder: number; content: string };
type RecipeForm = { name: string; categoryId: string; imageUrl: string; ingredients: IngForm[]; steps: StepForm[] };
const emptyForm = (): RecipeForm => ({ name: '', categoryId: '', imageUrl: '', ingredients: [{ name: '', quantity: '', unit: 'ml', isScalable: true, isInputAllowed: false, displayOrder: 1 }], steps: [{ stepOrder: 1, content: '' }] });
const UNITS = ['ml', 'g', 'viên', 'muỗng', 'thìa', 'lá', 'miếng', 'ly', 'shot', '%'];

// ─── Recipe Modal ────────────────────────────────────────────────────
const RecipeModal = ({ open, onClose, initialData, categories, editId }: { open: boolean; onClose: () => void; initialData: RecipeForm; categories: Category[]; editId: number | null }) => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<RecipeForm>(initialData);
  React.useEffect(() => { setForm(initialData); }, [open]);

  const save = useMutation({
    mutationFn: (d: RecipeForm) => {
      const p = { name: d.name, categoryId: d.categoryId ? Number(d.categoryId) : null, imageUrl: d.imageUrl || null, ingredients: d.ingredients.map((i, idx) => ({ name: i.name, quantity: parseFloat(i.quantity) || 0, unit: i.unit, isScalable: i.isScalable, isInputAllowed: i.isInputAllowed, displayOrder: idx + 1 })), steps: d.steps.map((s, idx) => ({ stepOrder: idx + 1, content: s.content })) };
      return editId ? api.put(`/recipes/${editId}`, p) : api.post('/recipes', p);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['recipes'] }); toast('success', editId ? 'Đã cập nhật công thức!' : 'Đã thêm công thức mới!'); onClose(); },
    onError: (e: any) => toast('error', e?.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.'),
  });

  const upIng = (i: number, k: keyof IngForm, v: any) => setForm(f => ({ ...f, ingredients: f.ingredients.map((x, idx) => idx === i ? { ...x, [k]: v } : x) }));
  const upStep = (i: number, v: string) => setForm(f => ({ ...f, steps: f.steps.map((x, idx) => idx === i ? { ...x, content: v } : x) }));

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg sm:text-xl font-bold">{editId ? 'Chỉnh sửa công thức' : 'Thêm công thức mới'}</h2>
          <button onClick={onClose}><X size={22} className="text-zinc-400" /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4">
          <div>
            <Label>Tên đồ uống *</Label>
            <Input className="mt-1" placeholder="VD: Cà phê sữa đá" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Danh mục</Label>
              <select className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
                <option value="">-- Chọn danh mục --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <Label>URL Hình ảnh</Label>
              <Input className="mt-1" placeholder="https://..." value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">Nguyên liệu</h3>
              <Button size="sm" variant="outline" onClick={() => setForm(f => ({ ...f, ingredients: [...f.ingredients, { name: '', quantity: '', unit: 'ml', isScalable: true, isInputAllowed: false, displayOrder: f.ingredients.length + 1 }] }))} className="gap-1 text-xs h-7"><Plus size={12} />Thêm</Button>
            </div>
            {form.ingredients.map((ing, i) => (
              <div key={i} className="mb-2 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700 space-y-2">
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5"><Input placeholder="Tên nguyên liệu" value={ing.name} onChange={e => upIng(i, 'name', e.target.value)} /></div>
                  <div className="col-span-3"><Input type="number" placeholder="SL" value={ing.quantity} onChange={e => upIng(i, 'quantity', e.target.value)} /></div>
                  <div className="col-span-3">
                    <select className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm" value={ing.unit} onChange={e => upIng(i, 'unit', e.target.value)}>
                      {UNITS.map(u => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {form.ingredients.length > 1 && <button onClick={() => setForm(f => ({ ...f, ingredients: f.ingredients.filter((_, idx) => idx !== i) }))}><X size={16} className="text-red-400" /></button>}
                  </div>
                </div>
                <div className="flex gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={ing.isScalable} onChange={e => upIng(i, 'isScalable', e.target.checked)} />Nhân theo tỷ lệ</label>
                  <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={ing.isInputAllowed} onChange={e => upIng(i, 'isInputAllowed', e.target.checked)} />Cho nhập tay</label>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">Các bước pha chế</h3>
              <Button size="sm" variant="outline" onClick={() => setForm(f => ({ ...f, steps: [...f.steps, { stepOrder: f.steps.length + 1, content: '' }] }))} className="gap-1 text-xs h-7"><Plus size={12} />Thêm</Button>
            </div>
            {form.steps.map((step, i) => (
              <div key={i} className="flex gap-2 items-center mb-2">
                <span className="w-7 h-9 flex items-center justify-center text-sm font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/30 rounded-md border border-amber-200 flex-shrink-0">{i + 1}</span>
                <Input placeholder={`Bước ${i + 1}...`} value={step.content} onChange={e => upStep(i, e.target.value)} />
                {form.steps.length > 1 && <button onClick={() => setForm(f => ({ ...f, steps: f.steps.filter((_, idx) => idx !== i) }))}><X size={16} className="text-red-400" /></button>}
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-3 p-4 sm:p-6 border-t border-zinc-200 dark:border-zinc-800">
          <Button variant="outline" className="flex-1" onClick={onClose}>Hủy</Button>
          <Button className="flex-1 bg-amber-600 hover:bg-amber-700 text-white" disabled={save.isPending || !form.name.trim()} onClick={() => save.mutate(form)}>
            {save.isPending ? 'Đang lưu...' : (editId ? 'Cập nhật' : 'Tạo công thức')}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Delete Confirm ──────────────────────────────────────────────────
const ConfirmDelete = ({ title, onConfirm, onClose, loading }: { title: string; onConfirm: () => void; onClose: () => void; loading: boolean }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
      <div className="flex items-center gap-3 text-red-600"><AlertTriangle size={24} /><h2 className="text-lg font-bold">Xác nhận xóa</h2></div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">Bạn có chắc muốn xóa <strong>"{title}"</strong>? Hành động này không thể hoàn tác.</p>
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onClose}>Hủy</Button>
        <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" disabled={loading} onClick={onConfirm}>{loading ? 'Đang xóa...' : 'Xóa'}</Button>
      </div>
    </div>
  </div>
);

// ─── Category Manager ───────────────────────────────────────────────
const CategoryManager = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [newName, setNewName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const { data: categories, isLoading } = useQuery<Category[]>({ queryKey: ['categories'], queryFn: async () => (await api.get('/categories')).data });

  const createMut = useMutation({
    mutationFn: () => api.post('/categories', { name: newName }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setNewName(''); toast('success', `Đã thêm danh mục "${newName}"`); },
    onError: (e: any) => toast('error', e?.response?.data?.message || 'Không thể thêm danh mục'),
  });
  const updateMut = useMutation({
    mutationFn: () => api.put(`/categories/${editId}`, { name: editName }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setEditId(null); toast('success', 'Đã cập nhật danh mục!'); },
    onError: (e: any) => toast('error', e?.response?.data?.message || 'Không thể cập nhật'),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => api.delete(`/categories/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setDeleteTarget(null); toast('success', 'Đã xóa danh mục!'); },
    onError: (e: any) => toast('error', e?.response?.data?.message || 'Không thể xóa danh mục'),
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-2">
            <Input placeholder="Tên danh mục mới..." value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && newName.trim() && createMut.mutate()} />
            <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-1 flex-shrink-0 text-sm" disabled={!newName.trim() || createMut.isPending} onClick={() => createMut.mutate()}>
              <Plus size={15} /><span className="hidden sm:inline">Thêm danh mục</span><span className="sm:hidden">Thêm</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          {isLoading ? <p className="text-sm text-muted-foreground text-center py-4">Đang tải...</p>
            : !categories?.length ? <p className="text-sm text-muted-foreground text-center py-4">Chưa có danh mục nào.</p>
            : (
              <div className="space-y-2">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center gap-2 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                    {editId === cat.id ? (
                      <>
                        <Input value={editName} onChange={e => setEditName(e.target.value)} className="flex-1" autoFocus onKeyDown={e => e.key === 'Enter' && updateMut.mutate()} />
                        <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs" disabled={updateMut.isPending} onClick={() => updateMut.mutate()}>Lưu</Button>
                        <Button size="sm" variant="outline" className="text-xs" onClick={() => setEditId(null)}>Hủy</Button>
                      </>
                    ) : (
                      <>
                        <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-700 flex items-center justify-center flex-shrink-0"><Layers size={13} /></div>
                        <span className="flex-1 font-medium text-sm">{cat.name}</span>
                        <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={() => { setEditId(cat.id); setEditName(cat.name); }}><Pencil size={12} />Sửa</Button>
                        <Button size="sm" variant="outline" className="gap-1 text-xs h-7 text-red-600 border-red-200 hover:bg-red-50" onClick={() => setDeleteTarget(cat)}><Trash2 size={12} />Xóa</Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
        </CardContent>
      </Card>
      {deleteTarget && <ConfirmDelete title={deleteTarget.name} loading={deleteMut.isPending} onConfirm={() => deleteMut.mutate(deleteTarget.id)} onClose={() => setDeleteTarget(null)} />}
    </div>
  );
};

// ─── Recipe Manager ─────────────────────────────────────────────────
const RecipeManager = ({ categories }: { categories: Category[] }) => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecipe, setEditRecipe] = useState<Recipe | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Recipe | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: recipes, isLoading } = useQuery<Recipe[]>({ queryKey: ['recipes'], queryFn: async () => (await api.get('/recipes')).data });
  const deleteMut = useMutation({
    mutationFn: (id: number) => api.delete(`/recipes/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['recipes'] }); setDeleteTarget(null); toast('success', 'Đã xóa công thức!'); },
    onError: (e: any) => toast('error', e?.response?.data?.message || 'Không thể xóa công thức'),
  });

  const getCatName = (id?: number) => categories.find(c => c.id === id)?.name;
  const getForm = (): RecipeForm => {
    if (!editRecipe) return emptyForm();
    return { name: editRecipe.name, categoryId: editRecipe.categoryId ? String(editRecipe.categoryId) : '', imageUrl: editRecipe.imageUrl || '', ingredients: editRecipe.ingredients?.map(i => ({ name: i.name, quantity: String(i.quantity), unit: i.unit, isScalable: i.isScalable, isInputAllowed: i.isInputAllowed, displayOrder: i.displayOrder })) || [{ name: '', quantity: '', unit: 'ml', isScalable: true, isInputAllowed: false, displayOrder: 1 }], steps: editRecipe.steps?.map(s => ({ stepOrder: s.stepOrder, content: s.content })) || [{ stepOrder: 1, content: '' }] };
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setEditRecipe(null); setModalOpen(true); }} className="bg-amber-600 hover:bg-amber-700 text-white gap-2 text-sm">
          <Plus size={16} />Thêm công thức
        </Button>
      </div>
      {isLoading ? <div className="text-center py-12 text-muted-foreground text-sm">Đang tải...</div>
        : !recipes?.length ? (
          <div className="text-center py-12">
            <Coffee size={40} className="mx-auto text-zinc-300 mb-3" />
            <p className="text-muted-foreground text-sm">Chưa có công thức nào.</p>
            <Button onClick={() => { setEditRecipe(null); setModalOpen(true); }} className="mt-4 bg-amber-600 hover:bg-amber-700 text-white gap-2 text-sm"><Plus size={15} />Thêm đầu tiên</Button>
          </div>
        ) : (
          <div className="space-y-2">
            {recipes.map(recipe => (
              <div key={recipe.id} className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4">
                  <button className="flex-1 flex items-center gap-3 text-left min-w-0" onClick={() => setExpandedId(expandedId === recipe.id ? null : recipe.id)}>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 truncate">{recipe.name}</p>
                      <div className="flex items-center flex-wrap gap-1.5 mt-1">
                        {getCatName(recipe.categoryId) && <span className="text-xs bg-amber-100 dark:bg-amber-950/50 text-amber-700 px-2 py-0.5 rounded-full">{getCatName(recipe.categoryId)}</span>}
                        <span className="text-xs text-muted-foreground">{recipe.ingredients?.length || 0} NL · {recipe.steps?.length || 0} bước</span>
                      </div>
                    </div>
                    {expandedId === recipe.id ? <ChevronUp size={16} className="text-zinc-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-zinc-400 flex-shrink-0" />}
                  </button>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => { setEditRecipe(recipe); setModalOpen(true); }}><Pencil size={12} /></Button>
                    <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50" onClick={() => setDeleteTarget(recipe)}><Trash2 size={12} /></Button>
                  </div>
                </div>
                {expandedId === recipe.id && (
                  <div className="border-t border-zinc-100 dark:border-zinc-800 p-3 sm:p-4 bg-zinc-50 dark:bg-zinc-900/50 grid sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-semibold mb-2 text-zinc-500 uppercase tracking-wide">Nguyên liệu</h4>
                      <div className="space-y-1">{recipe.ingredients?.map(i => <div key={i.id} className="flex justify-between text-sm"><span className="text-zinc-600 dark:text-zinc-400">{i.name}</span><span className="font-medium text-amber-600">{Number(i.quantity)} {i.unit}</span></div>)}</div>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold mb-2 text-zinc-500 uppercase tracking-wide">Các bước</h4>
                      <ol className="space-y-1">{recipe.steps?.map(s => <li key={s.id} className="flex gap-2 text-sm"><span className="text-amber-600 font-bold flex-shrink-0">{s.stepOrder}.</span><span className="text-zinc-600 dark:text-zinc-400">{s.content}</span></li>)}</ol>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      <RecipeModal open={modalOpen} onClose={() => setModalOpen(false)} initialData={getForm()} categories={categories} editId={editRecipe?.id || null} />
      {deleteTarget && <ConfirmDelete title={deleteTarget.name} loading={deleteMut.isPending} onConfirm={() => deleteMut.mutate(deleteTarget.id)} onClose={() => setDeleteTarget(null)} />}
    </div>
  );
};

// ─── Dashboard Page ─────────────────────────────────────────────────
export const DashboardPage = () => {
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState<'recipes' | 'categories'>('recipes');
  const { data: recipes } = useQuery<Recipe[]>({ queryKey: ['recipes'], queryFn: async () => (await api.get('/recipes')).data });
  const { data: categories } = useQuery<Category[]>({ queryKey: ['categories'], queryFn: async () => (await api.get('/categories')).data });

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{isAuthenticated ? 'Quản lý hệ thống' : 'Danh sách công thức'}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{isAuthenticated ? 'Quản lý công thức và danh mục pha chế.' : 'Đăng nhập để chỉnh sửa.'}</p>
      </div>
      <div className="grid gap-3 grid-cols-2">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><p className="text-xs sm:text-sm font-medium">Tổng công thức</p><Coffee className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-amber-600">{recipes?.length || 0}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><p className="text-xs sm:text-sm font-medium">Danh mục</p><Layers className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-amber-600">{categories?.length || 0}</div></CardContent></Card>
      </div>
      {isAuthenticated ? (
        <>
          <div className="flex border-b border-zinc-200 dark:border-zinc-800">
            {(['recipes', 'categories'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-amber-600 text-amber-600' : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'}`}>
                {t === 'recipes' ? '📋 Công thức' : '🏷️ Danh mục'}
              </button>
            ))}
          </div>
          {tab === 'recipes' && <RecipeManager categories={categories || []} />}
          {tab === 'categories' && <CategoryManager />}
        </>
      ) : (
        <RecipeManager categories={categories || []} />
      )}
    </div>
  );
};
