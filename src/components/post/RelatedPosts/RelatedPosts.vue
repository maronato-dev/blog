<template>
  <transition name="fade" mode="out-in" appear>
    <div class="flex relative flex-wrap container mx-auto">
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
import SameTagPosts from "./SameTagPosts.vue"
import { useRelatedPosts } from "../../../hooks/ghost/content/db/posts"
import PostCard from "../../collections/PostFeed/PostCard.vue"
import { LocalizedPostOrPage } from "../../../hooks/ghost/content/utils"

export default defineComponent({
  name: "RelatedPosts",
  components: { PostCard, SameTagPosts },
  props: {
    post: {
      type: Object as PropType<LocalizedPostOrPage>,
      required: true,
    },
  },
  setup(props) {
    const { next, prev, withTags, withTagsTotal } = useRelatedPosts(props.post)
    const nextAndPrev = computed(() => !!next && !!prev)

    return { next, prev, withTags, nextAndPrev, withTagsTotal }
  },
})
</script>
