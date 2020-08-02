<template>
  <router-link
    class="px-4 py-2 flex hover:bg-gray-100 dark-hover:bg-gray-900"
    :to="routerTo"
    :class="{ 'bg-gray-100 dark:bg-gray-900': focus }"
  >
    <div class="flex flex-col w-full">
      <template v-if="isPostOrPage">
        <div class="flex text-xs mt-2">
          <div class="text-gray-800 dark:text-gray-500">
            {{ date }}
          </div>
          <div
            class="ml-2 text-primary-400 dark:text-primary-300 font-semibold uppercase"
          >
            {{ primaryTag }}
          </div>
        </div>
        <div class="text-gray-900 dark:text-white text-base font-semibold my-2">
          {{ title }}
        </div>
      </template>
      <template v-else>
        <div class="flex text-xs mt-2">
          <div
            class="text-sm font-semibold mb-2 text-primary-400 dark:text-primary-300 uppercase"
          >
            {{ title }}
          </div>
        </div>
      </template>
    </div>
  </router-link>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from "vue"
import { useI18n } from "vue-i18n"
import { DocumentResult } from "../../../workers/search"

export default defineComponent({
  props: {
    result: {
      type: Object as PropType<DocumentResult>,
      required: true,
    },
    focus: Boolean,
  },
  setup(props) {
    const data = computed(() => props.result.data)
    const doc = computed(() => data.value.doc)
    const table = computed(() => data.value.table)

    const isPostOrPage = computed(() => table.value === "posts")
    const title = computed(() => {
      if ("page" in doc.value) {
        return doc.value.title
      } else {
        return doc.value.name
      }
    })
    const routerTo = computed(() => {
      const slug = doc.value.slug
      if (!isPostOrPage.value) {
        return { name: "tag", params: { slug } }
      }
      return { name: "postOrPage", params: { slug } }
    })
    const i18n = useI18n()
    const date = computed(() =>
      "page" in doc.value ? i18n.d(doc.value.publishedDate, "short") : undefined
    )
    const primaryTag = computed(() =>
      "primary_tag" in doc.value && doc.value.primary_tag
        ? doc.value.primary_tag.name
        : undefined
    )

    return { date, routerTo, title, isPostOrPage, primaryTag }
  },
})
</script>
