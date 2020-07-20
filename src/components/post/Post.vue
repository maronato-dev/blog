<template>
  <article>
    <div class="font-bold text-2xl">{{ post.title }}</div>
    <section>
      <post-content :html="post.html" />
    </section>
    <section class="py-10">
      <content-footnotes v-if="footnoteCount > 0" />
      <content-references v-if="referenceCount > 0" />
    </section>
  </article>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import { PostOrPage } from "@tryghost/content-api"
import PostContent from "./PostContent.vue"
import { usePostFootnotes, usePostReferences } from "../../hooks/postHelpers"
import ContentFootnotes from "../../components/collections/ContentFooter/ContentFootnotes.vue"
import ContentReferences from "../../components/collections/ContentFooter/ContentReferences.vue"

export default defineComponent({
  components: { PostContent, ContentFootnotes, ContentReferences },
  props: {
    post: {
      type: Object as PropType<PostOrPage>,
      required: true,
    },
  },
  setup() {
    const { count: footnoteCount } = usePostFootnotes()
    const { count: referenceCount } = usePostReferences()
    return { footnoteCount, referenceCount }
  },
})
</script>
