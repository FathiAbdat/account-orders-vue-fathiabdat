const brandDirectory = new URL(/* @vite-ignore */ __YUM_BRAND_PATH__, import.meta.url)

export const yumyMascotUrl = new URL('yumy.png', brandDirectory).href
