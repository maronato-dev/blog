<template>
  <div class="post-feed">
    <post-card v-for="(post, i) in posts" :key="post.id" :post="post" :large="makeLarge(i)" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import { PostOrPage } from "@tryghost/content-api"
import PostCard from "./PostCard.vue"

export default defineComponent({
  components: { PostCard },
  props: {
    posts: {
      type: Array as PropType<PostOrPage[]>,
      required: true,
    },
  },
  setup() {
    const makeLarge = (index: number) => index % 6 === 0
    return { makeLarge }
  },
})
</script>

<style scoped>
.post-feed {
  @apply relative flex flex-wrap;
}
</style>