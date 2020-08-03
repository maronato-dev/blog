<template>
  <div class="pt-12 container mx-auto">
    <div>{{ route.name }}</div>
    <transition name="fade" mode="out-in" appear>
      <loading-content v-if="keyLoading" />
      <post-feed v-else :posts="debouncedPosts" />
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, nextTick } from "vue"
import { useRoute } from "vue-router"
import { useI18n } from "vue-i18n"
import { useDebounce } from "@vueuse/core"
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

    // Fake loading transition to make better UI
    const debouncedPosts = useDebounce(posts, 50)
    const keyLoading = ref(false)
    const switchLoading = () =>
      nextTick(() => (keyLoading.value = loading.value || !keyLoading.value))
    // Auto switch off
    watch(keyLoading, v => v && switchLoading())
    // Show loading on change
    watch(posts, switchLoading)

    return { route, debouncedPosts, keyLoading, locale }
  },
})
</script>
