/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_GOOGLE_CLIENT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Global Google OAuth types
declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: any;
        oauth2?: any;
      };
    };
  }
}
