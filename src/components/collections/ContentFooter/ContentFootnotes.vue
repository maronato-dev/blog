<template>
  <base-footer :title="title">
    <footer-element
      v-for="[index, footnote] in footnotes"
      :key="index"
      :content-slot="footnote"
      :index="index"
      hash="fn"
    />
  </base-footer>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue"
import BaseFooter from "./BaseFooter.vue"
import FooterElement from "./FooterElement.vue"
import { usePostFootnotes } from "../../../hooks/postHelpers"
import { useI18n } from "vue-i18n"

export default defineComponent({
  components: { BaseFooter, FooterElement },
  setup() {
    const { slots } = usePostFootnotes()
    const slotEntries = computed(() =>
      Object.entries(slots.value).sort(([a], [b]) => parseInt(a) - parseInt(b))
    )

    const i18n = useI18n()
    const title = computed(() => i18n.t("postOrPage.footer.footnotes.title"))
    return { footnotes: slotEntries, title }
  },
})
</script>
