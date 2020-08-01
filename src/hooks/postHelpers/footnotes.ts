import { Slot } from "vue"
import { useCounter, provideCounter, createCouterKey } from "./utils"

const useFootnotesInjectionKey = createCouterKey("Post footnotes")

export const providePostFootnotes = () =>
  provideCounter(useFootnotesInjectionKey())

export const usePostFootnotes = (slot?: Slot) =>
  useCounter(useFootnotesInjectionKey(), slot)
