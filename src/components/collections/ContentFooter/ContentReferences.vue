<template>
  <base-footer :title="title">
    <footer-element
      v-for="[index, reference] in references"
      :key="index"
      :content-slot="reference"
      :index="index"
      hash="rf"
    />
  </base-footer>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue"
import { useI18n } from "vue-i18n"
import { usePostReferences } from "../../../hooks/postHelpers"
import BaseFooter from "./BaseFooter.vue"
import FooterElement from "./FooterElement.vue"

export default defineComponent({
  components: { BaseFooter, FooterElement },
  setup() {
    const { slots } = usePostReferences()
    const slotEntries = computed(() =>
      Object.entries(slots.value).sort(([a], [b]) => parseInt(a) - parseInt(b))
    )

    const i18n = useI18n()
    const title = computed(() => i18n.t("postOrPage.footer.references.title"))
    return { references: slotEntries, title }
  },
})
</script>
