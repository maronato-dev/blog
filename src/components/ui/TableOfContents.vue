<template>
  <aside class="text-current text-xs font-mono tracking-wider toc">
    <div class="opacity-75 font-semibold">Contents</div>
    <ol class="list-decimal pl-6">
      <li v-for="heading in toc" :key="heading.id" class="mb-1">
        <a class="animated-underline" :href="`#${heading.id}`">{{ heading.text }}</a>
      </li>
    </ol>
  </aside>
  <hr class="md:hidden my-10" />
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"

interface Heading {
  type: "H1" | "H2" | "H3" | "H4"
  id: string
  text: string
  el: Element
}

type Tags = Heading["type"]

export type TOC = Heading[]

const makeHeading = (element: Element): Heading => {
  return {
    type: element.tagName as Tags,
    id: element.id,
    text: element.textContent || "",
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