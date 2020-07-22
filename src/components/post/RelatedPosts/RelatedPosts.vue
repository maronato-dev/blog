<template>
  <transition name="fade" mode="out-in" appear>
    <loading-content v-if="pending" />
    <div v-else-if="!error" class="flex relative flex-wrap container mx-auto">
      <same-tag-posts
        v-if="withTags.length > 0"
        :posts="withTags"
        :total="withTagsTotal"
        :tag="post.primary_tag"
      />
      <post-card v-if="prev" no-border :post="prev" />
      <post-card v-if="next" no-border :post="next" />
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from "vue"
import { PostOrPage } from "@tryghost/content-api"
import SameTagPosts from "./SameTagPosts.vue"
import { useRelatedPosts } from "../../../hooks/ghost/content"
import LoadingContent from "../../ui/LoadingContent.vue"
import PostCard from "../../collections/PostFeed/PostCard.vue"

export default defineComponent({
  name: "RelatedPosts",
  components: { LoadingContent, PostCard, SameTagPosts },
  props: {
    post: {
      type: Object as PropType<PostOrPage>,
      required: true,
    },
  },
  setup(props) {
    const {
      next,
      prev,
      withTags,
      pending,
      error,
      withTagsTotal,
    } = useRelatedPosts(props.post)
    const nextAndPrev = computed(() => !!next && !!prev)

    return { next, prev, withTags, pending, error, nextAndPrev, withTagsTotal }
  },
})
</script>

<style lang="postcss" scoped>
</style>