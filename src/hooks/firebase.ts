import { onUnmounted, reactive, toRefs, ref, watch, computed, Ref } from "vue"
import { db } from "../db/firestore"
import { useGlobalOnline } from "./online"

interface PostInfo {
  id: string
  likes: number
}

export const usePostRef = (slug: Ref<string>) => {
  return computed(() => db.collection("posts").doc(slug.value))
}

export const useFirestorePost = (slug: Ref<string>) => {
  const online = useGlobalOnline()
  const post = reactive<PostInfo>({
    id: slug.value,
    likes: 0,
  })
  const loading = ref(true)
  const observer = ref(() => {
    return
  })

  const startObserver = () => {
    loading.value = true
    observer.value = usePostRef(slug).value.onSnapshot(snapshot => {
      if (!snapshot.exists) {
        db.collection("posts").doc(slug.value).set({ id: slug.value, likes: 0 })
      } else {
        Object.assign(post, snapshot.data())
        loading.value = false
      }
    })
  }

  const stopObserver = () => {
    loading.value = false
    observer.value()
  }

  // Register / Unregister on online or slug change
  watch(
    [online, slug],
    () => {
      if (online.value) {
        stopObserver()
        startObserver()
      } else if (!online.value) {
        stopObserver()
      }
    },
    { immediate: true }
  )

  // Unregister on unmount
  onUnmounted(stopObserver)

  return { ...toRefs(post), loading }
}
