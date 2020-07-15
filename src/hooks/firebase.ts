import { onUnmounted, reactive, toRefs } from "vue"
import { db } from "../db/firestore"

interface PostInfo {
  id: string
  likes: number
}

export const usePostRef = (slug: string) => {
  return db.collection("posts").doc(slug)
}

export const useFirestorePost = (slug: string) => {
  const post = reactive<PostInfo>({
    id: slug,
    likes: 0,
  })
  const observer = usePostRef(slug).onSnapshot(snapshot => {
    if (!snapshot.exists) {
      db.collection("posts").doc(slug).set(post)
    } else {
      Object.assign(post, snapshot.data())
    }
  })
  onUnmounted(observer)

  return toRefs(post)
}
