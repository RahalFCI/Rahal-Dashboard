# Rahal Dashboard

React + Vite dashboard for Rahal admins and vendors.

## Stack

- Vite React TypeScript
- Tailwind CSS
- Radix/shadcn-style primitives
- TanStack Query and TanStack Table
- React Hook Form + Zod
- Zustand auth/session store
- Axios API client with `ApiResponse<T>` unwrapping

## Commands

```bash
npm install
npm run dev
npm run build
npm run test
npm run lint
```

Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` if the backend is not running on `http://localhost:7145/api`.
