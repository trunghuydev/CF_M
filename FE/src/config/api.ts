/**
 * API Configuration — single source of truth
 *
 * Vite đọc biến từ file .env tương ứng với môi trường:
 *   - yarn dev   → .env.development
 *   - yarn build → .env.production
 *
 * Tất cả biến phải có prefix VITE_ để được expose ra client-side.
 * Tuyệt đối KHÔNG hardcode URL trong source code.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL as string;

if (!API_BASE_URL) {
  throw new Error(
    '[config/api.ts] VITE_API_URL is not defined. ' +
    'Check .env.development or .env.production'
  );
}
