<template>
  <div>
    <tag-header :tag="tag" :total="total" />
    <tag-posts :posts="posts" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import {
  LocalizedPublicTag,
  LocalizedPostOrPage,
} from "../../hooks/ghost/content/utils"
import TagHeader from "./TagHeader.vue"
import TagPosts from "./TagPosts.vue"

export default defineComponent({
  components: {
    TagHeader,
    TagPosts,
  },
  props: {
    tag: {
      type: Object as PropType<LocalizedPublicTag>,
      required: true,
    },
    posts: {
      type: Array as PropType<LocalizedPostOrPage[]>,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
  },
})
</script>
