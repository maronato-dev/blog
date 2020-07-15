<template>
  <article>
    <div class="font-bold text-2xl">{{ post.title }}</div>
    <section>
      <post-content :html="post.html" />
    </section>
  </article>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import { PostOrPage } from "@tryghost/content-api"
import PostContent from "./PostContent.vue"

export default defineComponent({
  components: { PostContent },
  props: {
    post: {
      type: Object as PropType<PostOrPage>,
      required: true,
    },
  },
})
</script>
