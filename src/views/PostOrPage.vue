<template>
  <main class="pb-2 relative flex-grow outer">
    <div class="max-1500 mx-auto">
      <transition name="fade" mode="out-in" appear>
        <loading-content v-if="loading" />
        <template v-else-if="content">
          <post-or-page :key="content.id" :content="content" />
        </template>
      </transition>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent, toRefs, computed } from "vue"
import { useI18n } from "vue-i18n"
import { useCurrentPageOrPost } from "../hooks/ghost/content/posts"
import LoadingContent from "../components/ui/LoadingContent.vue"
import PostOrPage from "../components/postOrPage/PostOrPage.vue"
import { useSEOTags } from "../hooks/seo"
import { useFormattedTitle } from "../hooks/ghost/content/title"

export default defineComponent({
  name: "PostOrPage",
  components: { PostOrPage, LoadingContent },
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
