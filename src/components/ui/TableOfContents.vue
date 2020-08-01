<template>
  <aside class="text-current text-sm tracking-wider toc">
    <div class="opacity-75 font-semibold">
      {{ contentsText }}
    </div>
    <ol class="list-decimal pl-5">
      <li v-for="heading in toc" :key="heading.id" class="py-1">
        <a class="animated-underline pt-0" :href="`#${heading.id}`">
          {{ heading.text }}
        </a>
      </li>
    </ol>
  </aside>
  <hr class="md:hidden dark:opacity-25 opacity-75 my-10" />
</template>

<script lang="ts">
import { defineComponent, computed } from "vue"
import { useI18n } from "vue-i18n"
import { useTOC } from "../../hooks/postHelpers/toc"

export default defineComponent({
  name: "TableOfContents",
  setup() {
    const i18n = useI18n()
    const contentsText = computed(() => i18n.t("ui.toc.contents-text"))

    const toc = useTOC()

    return { contentsText, toc }
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
