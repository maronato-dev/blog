<template>
  <div class="container mx-auto">
    <div>{{ route.name }}</div>
    <transition name="fade" mode="out-in" appear>
      <loading-content v-if="fetchState.pending" />
      <div v-else-if="fetchState.error">Error</div>
      <post-feed v-else :posts="posts" />
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch } from "vue"
import { useRoute } from "vue-router"
import PostFeed from "../components/collections/PostFeed/index.vue"
import LoadingContent from "../components/ui/LoadingContent.vue"
import { usePosts } from "../hooks/ghost/content"
import { useError } from "../hooks/layout"

export default defineComponent({
  name: "IndexPage",
  components: { PostFeed, LoadingContent },
  setup() {
    const route = useRoute()
    const { trigger500 } = useError()
    const { posts, fetchState } = usePosts(15)
    watch(() => fetchState.error, (error) => {
      if (error) {
        trigger500()
      }
    })
    return { route, posts, fetchState }
  },
})
</script>
