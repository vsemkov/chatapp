/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_IO_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}