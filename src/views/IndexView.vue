<template>
  <div class="pt-12 container mx-auto">
    <transition name="fade" mode="out-in" appear>
      <loading-content v-if="loading" />
      <post-feed v-else :posts="posts" />
    </transition>
    <load-more v-if="canLoadMore" @load-more="loadMore" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import PostFeed from "../components/collections/PostFeed/index.vue"
import LoadingContent from "../components/ui/LoadingContent.vue"
import { useDefaultTitle } from "../hooks/ghost/content/title"
import { usePosts } from "../hooks/ghost/content/posts"
import LoadMore from "../components/ui/LoadMore.vue"
import { useLocalizableFrontPage } from "../hooks/locale"

export default defineComponent({
  name: "IndexView",
  components: { PostFeed, LoadingContent, LoadMore },
  setup() {
    useDefaultTitle()
    useLocalizableFrontPage()
    const { posts, loading, loadMore, canLoadMore } = usePosts(6)

    return { posts, loading, canLoadMore, loadMore }
  },
})
</script>
