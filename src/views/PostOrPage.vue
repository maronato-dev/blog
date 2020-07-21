<template>
  <main class="mt-5 pb-2 relative flex-grow outer">
    <div class="max-1500 w-full mx-auto">
      <transition name="fade" mode="out-in" appear>
        <loading-content v-if="fetchState.pending" />
        <div v-else-if="fetchState.error">Error</div>
        <template v-else>
          <div v-if="content.page">Page</div>
          <post v-else :post="content" />
        </template>
      </transition>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { useCurrentPageOrPost } from "../hooks/ghost/content"
import {
  providePostFootnotes,
  providePostReferences,
} from "../hooks/postHelpers"
import LoadingContent from "../components/ui/LoadingContent.vue"
import Post from "../components/post/Post.vue"

export default defineComponent({
  name: "PostOrPage",
  components: { Post, LoadingContent },
  props: {
    slug: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { content, fetchState } = useCurrentPageOrPost(props.slug)

    // Provide post counters
    providePostFootnotes()
    providePostReferences()

    return { content, fetchState }
  },
})
</script>
<style lang="postcss" scoped>
.outer {
  padding: 0 5vw;
  font-size: 62.5%;
}
.max-1500 {
  max-width: 1500px;
}
</style>
