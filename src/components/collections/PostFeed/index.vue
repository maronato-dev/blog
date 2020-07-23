<template>
  <div class="relative flex flex-wrap">
    <post-card v-for="(post, i) in posts" :key="post.id" :post="post" :large="makeLarge(i)" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import PostCard from "./PostCard.vue"
import { LocalizedPostOrPage } from "../../../hooks/ghost/content/utils"

export default defineComponent({
  components: { PostCard },
  props: {
    posts: {
      type: Array as PropType<LocalizedPostOrPage[]>,
      required: true,
    },
  },
  setup() {
    const makeLarge = (index: number) => index % 6 === 0
    return { makeLarge }
  },
})
</script>
