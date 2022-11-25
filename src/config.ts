export const serverHostname = import.meta.env.DEV
  ? `http://localhost:${import.meta.env.VITE_PORT}`
  : `https://sixnimmt.fly.dev`

export const STORAGE_KEY = import.meta.env.DEV ? "6NimmtLocalDev" : "6NimmtProd"
