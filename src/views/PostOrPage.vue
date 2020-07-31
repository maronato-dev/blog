<template>
  <main class="mt-5 pb-2 relative flex-grow outer">
    <div class="max-1500 w-full mx-auto">
      <transition name="fade" mode="out-in" appear>
        <loading-content v-if="loading" />
        <template v-else-if="content">
          <page v-if="content.page" :page="content" />
          <post v-else :key="content.id" :post="content" />
        </template>
      </transition>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent, toRefs, computed } from "vue"
import { useI18n } from "vue-i18n"
import { useCurrentPageOrPost } from "../hooks/ghost/content/posts"
import {
  providePostFootnotes,
  providePostReferences,
} from "../hooks/postHelpers"
import LoadingContent from "../components/ui/LoadingContent.vue"
import Post from "../components/postOrPage/post/Post.vue"
import Page from "../components/postOrPage/page/Page.vue"
import { useSEOTags } from "../hooks/seo"
import { useFormattedTitle } from "../hooks/ghost/content/title"

export default defineComponent({
  name: "PostOrPage",
  components: { Post, Page, LoadingContent },
  props: {
    slug: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { slug } = toRefs(props)
    const { content, loading } = useCurrentPageOrPost(slug)

    // Load SEO and title
    const i18n = useI18n()
    const title = computed(() =>
      content.value
        ? content.value.title || ""
        : i18n.t("postOrPage.head.title.loading")
    )
    useFormattedTitle(title)
    useSEOTags(content)

    // Provide post counters
    providePostFootnotes()
    providePostReferences()

    return { content, loading }
  },
})
</script>
<style lang="postcss" scoped>
.outer {
  padding: 0 5vw;
}
.max-1500 {
  max-width: 1500px;
}
</style>
