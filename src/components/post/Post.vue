<template>
  <article>
    <post-header :post="post" />
    <section v-if="showToc">
      <table-of-contents :toc="toc" />
    </section>
    <section>
      <post-content :aside="aside" :html="post.html" />
    </section>
    <section class="py-10 container mx-auto">
      <content-footnotes v-if="footnoteCount > 0" />
      <content-references v-if="referenceCount > 0" />
    </section>
    <section>
      <related-posts :post="post" />
    </section>
    <section>
      <commento v-if="online" />
    </section>
  </article>
</template>

<script lang="ts">
import { defineComponent, PropType, watch, ref, onMounted, computed } from "vue"
import PostContent from "./PostContent.vue"
import PostHeader from "./PostHeader.vue"
import RelatedPosts from "./RelatedPosts/RelatedPosts.vue"
import { usePostFootnotes, usePostReferences } from "../../hooks/postHelpers"
import ContentFootnotes from "../../components/collections/ContentFooter/ContentFootnotes.vue"
import ContentReferences from "../../components/collections/ContentFooter/ContentReferences.vue"
import TableOfContents, {
  buildToc,
  TOC,
} from "../../components/ui/TableOfContents.vue"
import Commento from "../../components/ui/Commento.vue"
import { useI18n } from "vue-i18n"
import { LocalizedPostOrPage } from "../../hooks/ghost/content/utils"
import { useGlobalOnline } from "../../hooks/online"

export default defineComponent({
  components: {
    PostContent,
    ContentFootnotes,
    ContentReferences,
    TableOfContents,
    PostHeader,
    Commento,
    RelatedPosts,
  },
  props: {
    post: {
      type: Object as PropType<LocalizedPostOrPage>,
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
      !props.post.reading_time ? false : props.post.reading_time >= 5
    )

    const aside = computed(() => {
      return footnoteCount.value > 0 || showToc.value
    })

    const online = useGlobalOnline()

    return { footnoteCount, referenceCount, toc, aside, showToc, online }
  },
})
</script>
