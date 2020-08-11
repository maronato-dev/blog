<template>
  <div class="pb-2 relative flex-grow outer">
    <div class="max-1500 mx-auto">
      <transition name="fade" mode="out-in" appear>
        <loading-content v-if="loading" />
        <template v-else-if="tag">
          <tag :key="tag.id" :posts="posts" :tag="tag" :total="total" />
        </template>
      </transition>
      <load-more v-if="canLoadMore" @load-more="loadMore" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRef, computed } from "vue"
import { useI18n } from "vue-i18n"
import { usePostsWithCurrentTag } from "../hooks/ghost/content/posts"
import { useFormattedTitle } from "../hooks/ghost/content/title"
import LoadingContent from "../components/ui/LoadingContent.vue"
import Tag from "../components/tag/Tag.vue"
import LoadMore from "../components/ui/LoadMore.vue"

export default defineComponent({
  components: { Tag, LoadingContent, LoadMore },
  props: {
    slug: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const slug = toRef(props, "slug")

    const {
      posts,
      canLoadMore,
      loadMore,
      loading,
      tag,
      total,
    } = usePostsWithCurrentTag(slug)

    const i18n = useI18n()
    const title = computed(() =>
      tag.value ? tag.value.name || "" : i18n.t("postOrPage.head.title.loading")
    )
    useFormattedTitle(title)

    return { posts, canLoadMore, loadMore, loading, tag, total }
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
