/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TINYMCE_API_KEY: string
  readonly VITE_API_ENDPOINT_PREFIX: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
