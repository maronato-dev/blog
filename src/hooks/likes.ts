import { createGlobalState, useStorage } from "@vueuse/core"
import { computed, Ref } from "vue"
import firebase from "firebase/app"
import { useFirestorePost, usePostRef } from "./firebase"

interface LikedPosts {
  [slug: string]: boolean
}

export const useLocalLikesStore = createGlobalState(() =>
  useStorage("likes", {} as LikedPosts)
)

export const useLocalPostLikes = (slug: Ref<string>) => {
  const store = useLocalLikesStore()
  const liked = computed(() => !!store.value[slug.value])
  const like = () => {
    store.value[slug.value] = true
  }
  const dislike = () => {
    store.value[slug.value] = false
  }
  return { liked, like, dislike }
}

export const usePostLikes = (slug: Ref<string>) => {
  const increment = firebase.firestore.FieldValue.increment(1)
  const decrement = firebase.firestore.FieldValue.increment(-1)
  const { liked, like: likeLocal, dislike: dislikeLocal } = useLocalPostLikes(
    slug
  )
  const { likes, loading } = useFirestorePost(slug)
  const postRef = usePostRef(slug)

  const like = () => {
    likeLocal()
    postRef.value.update({ likes: increment })
  }
  const dislike = () => {
    dislikeLocal()
    postRef.value.update({ likes: decrement })
  }

  const toggleLike = () => {
    if (liked.value) {
      dislike()
    } else {
      like()
    }
  }

  return { likes, liked, like, dislike, toggleLike, loading }
}
