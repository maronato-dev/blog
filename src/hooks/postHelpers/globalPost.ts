import { InjectionKey, Ref, provide, inject, ref } from "vue"
import { LocalizedPostOrPage } from "../ghost/content/utils"

const currentPostOrPageKey: InjectionKey<Ref<
  LocalizedPostOrPage | undefined
>> = Symbol("Reference to current post or page")

export const provideGlobalCurrentPostOrPage = (
  postOrPage: Ref<LocalizedPostOrPage | undefined>
) => {
  provide(currentPostOrPageKey, postOrPage)
}

export const useGlobalCurrentPostOrPage = () => {
  const postOrPage = inject(currentPostOrPageKey, ref())
  return postOrPage
}
