import { InjectionKey, Ref, ref, provide, inject, Slot, watch } from "vue"
import { useI18n } from "vue-i18n"

export interface SlotMap {
  [counter: number]: Slot | undefined
}

export interface Counter {
  count: Ref<number>
  slots: Ref<SlotMap>
}

export const createCouterKey = (keyName: string) => {
  const key: InjectionKey<Counter> = Symbol(keyName)
  return () => key
}

export const provideCounter = <T extends Counter, K extends InjectionKey<T>>(
  injectionKey: K
) => {
  const count = ref(0)
  const slots = ref<SlotMap>({})
  provide(injectionKey, { count, slots })

  // Reset on locale change
  const i18n = useI18n()
  watch(i18n.locale, () => {
    count.value = 0
    slots.value = {}
  })
}

export const useCounter = <T extends Counter, K extends InjectionKey<T>>(
  injectionKey: K,
  slot?: Slot
) => {
  const counter = inject(injectionKey)
  if (typeof counter === "undefined") {
    throw Error(`Counter "${injectionKey.description}" not provided!`)
  }
  const { count, slots } = counter
  // Auto increment on use
  if (slot) {
    count.value += 1
    slots.value[count.value] = slot
  }
  const assigned = count.value
  return { assigned, count, slots }
}
