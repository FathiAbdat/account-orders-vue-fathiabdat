/// <reference types="vite/client" />

declare module '*.css?inline' {
  const css: string
  export default css
}

declare const __YUM_FONT_PATH__: string
declare const __YUM_BRAND_PATH__: string
