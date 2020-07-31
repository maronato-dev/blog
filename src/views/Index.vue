<template>
  <div class="container mx-auto">
    <div>{{ route.name }}</div>
    <transition name="fade" mode="out-in" appear>
      <loading-content v-if="loading" />
      <post-feed v-else :key="locale" :posts="posts" />
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { useRoute } from "vue-router"
import { useI18n } from "vue-i18n"
import PostFeed from "../components/collections/PostFeed/index.vue"
import LoadingContent from "../components/ui/LoadingContent.vue"
import { useDefaultTitle } from "../hooks/ghost/content/title"
import { usePosts } from "../hooks/ghost/content/posts"

export default defineComponent({
  name: "IndexPage",
  components: { PostFeed, LoadingContent },
  setup() {
    useDefaultTitle()
    const route = useRoute()
    const { locale } = useI18n()
    const { posts, loading } = usePosts(15)

    return { route, posts, loading, locale }
  },
})
</script>
