import { onUnmounted, reactive, toRefs, ref, watch } from "vue"
import { db } from "../db/firestore"
import { useGlobalOnline } from "./online"

interface PostInfo {
  id: string
  likes: number
}

export const usePostRef = (slug: string) => {
  return db.collection("posts").doc(slug)
}

export const useFirestorePost = (slug: string) => {
  const online = useGlobalOnline()
  const post = reactive<PostInfo>({
    id: slug,
    likes: 0,
  })
  const loading = ref(true)
  const observer = ref(() => {
    return
  })

  // Register / Unregister on online change
  watch(
    online,
    () => {
      if (online.value) {
        loading.value = true
        observer.value = usePostRef(slug).onSnapshot(snapshot => {
          if (!snapshot.exists) {
            db.collection("posts").doc(slug).set(post)
          } else {
            Object.assign(post, snapshot.data())
            loading.value = false
          }
        })
      } else if (!online.value) {
        loading.value = false
        observer.value()
      }
    },
    { immediate: true }
  )

  // Unregister on unmount
  onUnmounted(() => observer.value())

  return { ...toRefs(post), loading }
}
