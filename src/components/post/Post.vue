<template>
  <article>
    <div class="font-bold text-2xl">{{ post.title }}</div>
    <section v-if="showToc">
      <table-of-contents :toc="toc" />
    </section>
    <section>
      <post-content :aside="aside" :html="post.html" />
    </section>
    <section class="py-10">
      <content-footnotes v-if="footnoteCount > 0" />
      <content-references v-if="referenceCount > 0" />
    </section>
  </article>
</template>

<script lang="ts">
import { defineComponent, PropType, watch, ref, onMounted, computed } from "vue"
import { PostOrPage } from "@tryghost/content-api"
import PostContent from "./PostContent.vue"
import { usePostFootnotes, usePostReferences } from "../../hooks/postHelpers"
import ContentFootnotes from "../../components/collections/ContentFooter/ContentFootnotes.vue"
import ContentReferences from "../../components/collections/ContentFooter/ContentReferences.vue"
import TableOfContents, {
  buildToc,
  TOC,
} from "../../components/ui/TableOfContents.vue"
import { useI18n } from "vue-i18n"

export default defineComponent({
  components: {
    PostContent,
    ContentFootnotes,
    ContentReferences,
    TableOfContents,
  },
  props: {
    post: {
      type: Object as PropType<PostOrPage>,
      required: true,
    },
  },
  setup(props) {
    const { count: footnoteCount } = usePostFootnotes()
    const { count: referenceCount } = usePostReferences()

    const i18n = useI18n()
    const toc = ref<TOC>([])
    const updateToc = () =>
      (toc.value = buildToc(document.querySelector(".ghost-content")))
    onMounted(updateToc)
    watch(i18n.locale, () => {
      updateToc()
    })
    const showToc = computed(() =>
      !props.post.reading_time ? false : props.post.reading_time < 10
    )

    const aside = computed(() => {
      return footnoteCount.value > 0 || showToc.value
    })

    return { footnoteCount, referenceCount, toc, aside, showToc }
  },
})
</script>
