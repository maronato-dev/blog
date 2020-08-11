<template>
  <div class="relative flex flex-wrap container mx-auto">
    <post-card v-for="post in posts" :key="post.id" :post="post" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import { LocalizedPostOrPage } from "../../hooks/ghost/content/utils"
import PostCard from "../collections/PostFeed/PostCard.vue"

export default defineComponent({
  components: { PostCard },
  props: {
    posts: {
      type: Array as PropType<LocalizedPostOrPage[]>,
      required: true,
    },
  },
})
</script>
