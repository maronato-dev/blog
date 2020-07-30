/**
 * Reimplementation and minor tweaks of vueuse hooks https://github.com/antfu/vueuse
 */

import { ref, computed, Ref, watch } from "vue"

export function useMediaQueryAlt(query: string) {
  let mediaQuery!: MediaQueryList

  // try to fetch initial value (avoid SSR issues)
  if (typeof window !== "undefined") mediaQuery = window.matchMedia(query)

  const matches = ref(mediaQuery ? mediaQuery.matches : false)
  function handler(event: MediaQueryListEvent) {
    matches.value = event.matches
  }

  if (!mediaQuery) mediaQuery = window.matchMedia(query)

  matches.value = mediaQuery.matches
  mediaQuery.addListener(handler)

  return matches
}

export function usePreferredColorSchemeAlt() {
  const isLight = useMediaQueryAlt("(prefers-color-scheme: light)")
  const isDark = useMediaQueryAlt("(prefers-color-scheme: dark)")

  return computed(() => {
    if (isDark.value) return "dark"
    if (isLight.value) return "light"
    return "no-preference"
  })
}

export function createGlobalStateAlt<T>(factory: () => T) {
  const state = factory()
  return () => state
}

const Serializers = {
  boolean: {
    read: (v: unknown, d: unknown) => (v != null ? v === "true" : d),
    write: (v: unknown) => String(v),
  },
  object: {
    read: (v: string | null, d: unknown) => (v ? JSON.parse(v) : d),
    write: (v: unknown) => JSON.stringify(v),
  },
  number: {
    read: (v: string | null, d: unknown) =>
      v != null ? Number.parseFloat(v) : d,
    write: (v: unknown) => String(v),
  },
  unknown: {
    read: (v: unknown, d: unknown) => v ?? d,
    write: (v: unknown) => String(v),
  },
  string: {
    read: (v: unknown, d: unknown) => v ?? d,
    write: (v: unknown) => String(v),
  },
}

export function useStorageAlt(
  key: string,
  defaultValue: string,
  storage?: Storage
): Ref<string>
export function useStorageAlt(
  key: string,
  defaultValue: boolean,
  storage?: Storage
): Ref<boolean>
export function useStorageAlt(
  key: string,
  defaultValue: number,
  storage?: Storage
): Ref<number>
export function useStorageAlt(
  key: string,
  defaultValue: Date,
  storage?: Storage
): Ref<Date>
export function useStorageAlt<T extends Record<string, unknown>>(
  key: string,
  defaultValue: T,
  storage?: Storage
): Ref<T>
export function useStorageAlt<T extends null>(
  key: string,
  defaultValue: null,
  storage?: Storage
): Ref<unknown>
export function useStorageAlt<
  T extends string | number | boolean | Record<string, unknown> | null
>(key: string, defaultValue: T, storage: Storage = localStorage) {
  const data = ref<T>(defaultValue)

  const type =
    defaultValue == null
      ? "unknown"
      : typeof defaultValue === "boolean"
      ? "boolean"
      : typeof defaultValue === "string"
      ? "string"
      : typeof defaultValue === "object"
      ? "object"
      : Array.isArray(defaultValue)
      ? "object"
      : !Number.isNaN(defaultValue)
      ? "number"
      : "unknown"

  function read() {
    try {
      let rawValue = storage.getItem(key)
      if (rawValue === undefined && defaultValue) {
        rawValue = Serializers[type].write(defaultValue)
        storage.setItem(key, rawValue)
      } else {
        data.value = Serializers[type].read(rawValue, defaultValue)
      }
    } catch (e) {
      console.warn(e)
    }
  }

  read()

  addEventListener("storage", read)

  watch(
    data,
    () => {
      try {
        if (data.value == null) storage.removeItem(key)
        else storage.setItem(key, Serializers[type].write(data.value))
      } catch (e) {
        console.warn(e)
      }
    },
    { flush: "post", deep: true }
  )

  return data
}
