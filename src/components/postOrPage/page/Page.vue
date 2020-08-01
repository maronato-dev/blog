<template>
  <article>
    <page-header :page="page" />
    <section v-if="showTOC">
      <table-of-contents />
    </section>
    <section class="mb-10 lg:mb-20">
      <page-content :html="page.html" />
    </section>
    <section class="mb-10 lg:mb-20">
      <content-footnotes v-if="footnoteCount > 0" />
      <content-references v-if="referenceCount > 0" />
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
  useShowTOC,
  provideTOC,
} from "../../../hooks/postHelpers/index"
import ContentFootnotes from "../../../components/collections/ContentFooter/ContentFootnotes.vue"
import ContentReferences from "../../../components/collections/ContentFooter/ContentReferences.vue"
import TableOfContents from "../../../components/ui/TableOfContents.vue"
import { LocalizedPostOrPage } from "../../../hooks/ghost/content/utils"
import PageContent from "../PostOrPageContent.vue"
import PageHeader from "./PageHeader.vue"

export default defineComponent({
  components: {
    PageContent,
    ContentFootnotes,
    ContentReferences,
    TableOfContents,
    PageHeader,
  },
  props: {
    page: {
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

    const tocElement = ref(document.querySelector(".ghost-content"))
    const { updateTOC } = provideTOC(tocElement)
    onMounted(updateTOC)
    watch(i18n.locale, updateTOC)
    const showTOC = useShowTOC()

    return { footnoteCount, referenceCount, showTOC }
  },
})
</script>
