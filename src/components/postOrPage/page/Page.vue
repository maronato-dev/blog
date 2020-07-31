<template>
  <article>
    <page-header :page="page" />
    <section v-if="showToc">
      <table-of-contents :toc="toc" />
    </section>
    <section>
      <page-content :aside="aside" :html="page.html" />
    </section>
    <section class="py-10 container mx-auto">
      <content-footnotes v-if="footnoteCount > 0" />
      <content-references v-if="referenceCount > 0" />
    </section>
  </article>
</template>

<script lang="ts">
import { defineComponent, PropType, watch, ref, onMounted, computed } from "vue"
import { useI18n } from "vue-i18n"
import { usePostFootnotes, usePostReferences } from "../../../hooks/postHelpers"
import ContentFootnotes from "../../../components/collections/ContentFooter/ContentFootnotes.vue"
import ContentReferences from "../../../components/collections/ContentFooter/ContentReferences.vue"
import TableOfContents, {
  buildToc,
  TOC,
} from "../../../components/ui/TableOfContents.vue"
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
      !props.page.reading_time ? false : props.page.reading_time >= 5
    )

    const aside = computed(() => {
      return footnoteCount.value > 0 || showToc.value
    })

    return { footnoteCount, referenceCount, toc, aside, showToc }
  },
})
</script>
