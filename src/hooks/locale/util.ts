export type Locales = "pt" | "en"

export const availableLocales: Locales[] = ["pt", "en"]

export const isLocale = (locale: unknown): locale is Locales =>
  availableLocales.includes(locale as Locales)
