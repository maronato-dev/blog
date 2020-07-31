<template>
  <main class="mt-5 pb-2 relative flex-grow outer">
    <div class="max-1500 w-full mx-auto">
      <transition name="fade" mode="out-in" appear>
        <loading-content v-if="requestState.pending" />
        <div v-else-if="requestState.error">Error</div>
        <page v-else-if="content.page" :page="content" />
        <post v-else :post="content" />
      </transition>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent, watchEffect } from "vue"
import { usePreviewPostOrPage } from "../hooks/ghost/admin"
import {
  providePostFootnotes,
  providePostReferences,
} from "../hooks/postHelpers"
import { useError } from "../hooks/layout"
import { useFormattedTitle } from "../hooks/ghost/content/title"
import LoadingContent from "../components/ui/LoadingContent.vue"
import Post from "../components/postOrPage/post/Post.vue"
import Page from "../components/postOrPage/page/Page.vue"

export default defineComponent({
  name: "PreviewPage",
  components: { Post, LoadingContent, Page },
  props: {
    uuid: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { trigger404 } = useError()
    const { content, requestState } = usePreviewPostOrPage(props.uuid)
    watchEffect(() => {
      const hasError = !!requestState.value.error
      const pending = requestState.value.pending
      const postLoaded = !!content.value
      if (hasError || (!pending && !postLoaded)) {
        trigger404()
      }
    })

    // Provide post counters
    providePostFootnotes()
    providePostReferences()

    // Set title
    useFormattedTitle("Preview")

    return { content, requestState }
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
