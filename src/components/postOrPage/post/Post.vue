<template>
  <article>
    <post-header :post="post" />
    <section v-if="showTOC">
      <table-of-contents />
    </section>
    <section class="mb-10 lg:mb-20">
      <post-content :html="post.html" />
    </section>
    <section class="mb-10 lg:mb-20">
      <content-footnotes v-if="footnoteCount > 0" />
      <content-references v-if="referenceCount > 0" />
    </section>
    <section class="mb-10 lg:mb-20">
      <commento v-if="online" />
    </section>
    <section class="mb-10 lg:mb-20">
      <related-posts :post="post" />
    </section>
  </article>
</template>

<script lang="ts">
import { defineComponent, PropType, watch, ref, onMounted } from "vue"
import { useI18n } from "vue-i18n"
import {
  usePostFootnotes,
  usePostReferences,
  providePostFootnotes,
  providePostReferences,
  provideTOC,
  useShowTOC,
} from "../../../hooks/postHelpers/index"
import ContentFootnotes from "../../../components/collections/ContentFooter/ContentFootnotes.vue"
import ContentReferences from "../../../components/collections/ContentFooter/ContentReferences.vue"
import TableOfContents from "../../../components/ui/TableOfContents.vue"
import Commento from "../../../components/ui/Commento.vue"
import { LocalizedPostOrPage } from "../../../hooks/ghost/content/utils"
import { useGlobalOnline } from "../../../hooks/online"
import PostContent from "../PostOrPageContent.vue"
import PostHeader from "./PostHeader.vue"
import RelatedPosts from "./RelatedPosts/RelatedPosts.vue"

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
  setup() {
    // Provide post counters
    providePostFootnotes()
    providePostReferences()

    const { count: footnoteCount } = usePostFootnotes()
    const { count: referenceCount } = usePostReferences()

    const i18n = useI18n()

    const tocElement = ref<Element | null>(null)
    const { updateTOC } = provideTOC(tocElement)
    onMounted(() => {
      tocElement.value = document.querySelector(".ghost-content")
    })
    watch(i18n.locale, updateTOC)
    const showTOC = useShowTOC()

    const online = useGlobalOnline()

    return { footnoteCount, referenceCount, showTOC, online }
  },
})
</script>
