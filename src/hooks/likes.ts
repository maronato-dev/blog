import { createGlobalState, useStorage } from "@vueuse/core"
import { computed, watch } from "vue"
import firebase from "firebase/app"
import { useFirestorePost, usePostRef } from "./firebase"

interface LikedPosts {
  [slug: string]: boolean
}

export const useLocalLikesStore = createGlobalState(() =>
  useStorage("likes", {} as LikedPosts)
)

export const useLocalPostLikes = (slug: string) => {
  const store = useLocalLikesStore()
  const liked = computed(() => !!store.value[slug])
  const like = () => {
    store.value[slug] = true
  }
  const dislike = () => {
    store.value[slug] = false
  }
  return { liked, like, dislike }
}

export const usePostLikes = (slug: string) => {
  const increment = firebase.firestore.FieldValue.increment(1)
  const decrement = firebase.firestore.FieldValue.increment(-1)
  const { liked, like, dislike } = useLocalPostLikes(slug)
  const { likes, loading } = useFirestorePost(slug)
  const postRef = usePostRef(slug)

  watch(liked, value => {
    const operation = value ? increment : decrement
    postRef.update({ likes: operation })
  })

  const toggleLike = () => {
    if (liked.value) {
      dislike()
    } else {
      like()
    }
  }

  return { likes, liked, like, dislike, toggleLike, loading }
}
