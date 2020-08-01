import { Slot } from "vue"
import { useCounter, createCouterKey, provideCounter } from "./utils"

const useReferencesInjectionKey = createCouterKey("Post references")

export const providePostReferences = () =>
  provideCounter(useReferencesInjectionKey())
export const usePostReferences = (slot?: Slot) =>
  useCounter(useReferencesInjectionKey(), slot)
