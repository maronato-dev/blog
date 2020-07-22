<template>
  <div class="tag-posts">
    <h3 class="text-xs font-light uppercase">
      <span class="opacity-50 mr-2">More in</span>
      <router-link
        class="opacity-100 animated-underline"
        :to="{name: 'tag', params: { slug: tag.slug }}"
      >{{ tag.name }}</router-link>
    </h3>
    <div>
      <ul class="mt-5 mb-16">
        <same-tag-items v-for="post in posts" :key="post.id" class="mb-10" :post="post" />
      </ul>
    </div>
    <div class>
      <router-link
        :to="{ name: 'tag', params: { slug: tag.slug } }"
        class="bg-transparent border rounded-full p-3 opacity-75 hover:opacity-100 hover:text-primary-400 hover:border-primary-400 transition-all duration-500 cursor-pointer text-sm"
      >See all {{ total }} posts →</router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import { PostOrPage, Tag } from "@tryghost/content-api"
import SameTagItems from "./SameTagPostsItem.vue"

export default defineComponent({
  components: { SameTagItems },
  props: {
    posts: {
      type: Array as PropType<PostOrPage[]>,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    tag: {
      type: Object as PropType<Tag>,
      required: true,
    },
  },
})
</script>

<style lang="postcss" scoped>
.tag-posts {
  max-height: 100rem;
  min-width: 20rem;
  @apply w-full p-5 pb-8 flex flex-col mb-8 rounded-lg;

  @screen md {
    @apply w-1/2;
  }
  @screen lg {
    @apply max-w-screen-sm w-auto;
  }
}
</style>