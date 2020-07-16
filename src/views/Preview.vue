<template>
  <div class="container mx-auto">
    <transition name="fade" mode="out-in" appear>
      <loading-content v-if="requestState.pending" />
      <div v-else-if="requestState.error">Error</div>
      <div v-else>
        <RenderHtml :html="post.html" />
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, watchEffect } from "vue"
import { useRoute } from "vue-router"
import { usePreviewPost } from "../hooks/ghost/admin"
import RenderHtml from "../components/render/RenderHtml.vue"
import LoadingContent from "../components/ui/LoadingContent.vue"
import { useError } from "../hooks/layout"

export default defineComponent({
  name: "IndexPage",
  components: { RenderHtml, LoadingContent },
  props: {
    uuid: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const route = useRoute()
    const { trigger404 } = useError()
    const { post, requestState } = usePreviewPost(props.uuid)
    watchEffect(() => {
      const hasError = !!requestState.error
      const pending = requestState.pending
      const postLoaded = !!post.value
      if (hasError || (!pending && !postLoaded)) {
        trigger404()
      }
    })
    return { route, post, requestState }
  },
})
</script>
