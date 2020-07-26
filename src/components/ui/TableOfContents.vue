<template>
  <aside class="text-current text-sm tracking-wider toc">
    <div class="opacity-75 font-semibold">{{ contentsText }}</div>
    <ol class="list-decimal pl-5">
      <li v-for="heading in toc" :key="heading.id" class="py-1">
        <a class="animated-underline pt-0" :href="`#${heading.id}`">{{ heading.text }}</a>
      </li>
    </ol>
  </aside>
  <hr class="md:hidden my-10" />
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from "vue"
import { useI18n } from "vue-i18n"

interface Heading {
  type: "H1" | "H2" | "H3" | "H4"
  id: string
  text: string
  el: Element
}

type Tags = Heading["type"]

export type TOC = Heading[]

const removeAnchor = (str: string) =>
  str[str.length - 1] === "#" ? str.slice(0, str.length - 1) : str

const makeHeading = (element: Element): Heading => {
  return {
    type: element.tagName as Tags,
    id: element.id,
    text: removeAnchor(element.textContent || ""),
    el: element,
  }
}

export const buildToc = (root: Element | null): TOC => {
  if (!root) {
    return []
  }
  return Array.from(root.querySelectorAll("h1, h2, h3")).map(makeHeading)
}

export default defineComponent({
  name: "TableOfContents",
  props: {
    toc: {
      type: Array as PropType<TOC>,
      required: true,
    },
  },
  setup() {
    const i18n = useI18n()
    const contentsText = computed(() => i18n.t("ui.toc.contents-text"))
    return { contentsText }
  },
})
</script>
<style lang="postcss" scoped>
aside {
  @screen md {
    @apply float-right pl-4;
    width: calc(100% / 4);
  }
  @screen lg {
    @apply pr-4;
    width: calc(100% / 3);
  }
  @screen xl {
    @apply float-left;
    width: calc(100% / 4);
  }
}
</style>