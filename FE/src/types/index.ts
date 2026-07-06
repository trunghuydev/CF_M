export type Role = 'ADMIN' | 'STAFF';

export interface User {
  id: number;
  email: string;
  role: Role;
}

export interface Category {
  id: number;
  name: string;
}

export interface RecipeIngredient {
  id?: number;
  name: string;
  quantity: number;
  unit: string;
  isScalable: boolean;
  isInputAllowed: boolean;
  displayOrder: number;
}

export interface RecipeStep {
  id?: number;
  stepOrder: number;
  content: string;
}

export interface Recipe {
  id: number;
  categoryId?: number;
  name: string;
  imageUrl?: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
}
