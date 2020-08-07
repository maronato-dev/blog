<template>
  <router-link
    class="mt-0 mb-2 text-primary-400 dark:text-primary-300 font-semibold uppercase animated-underline opacity-100 text-base"
    :to="`/tag/${primaryTag.slug}`"
  >
    {{ primaryTag.name }}
  </router-link>
</template>

<script lang="ts">
import { defineComponent, PropType, toRef, computed } from "vue"
import { LocalizedPostOrPage } from "../../../hooks/ghost/content/utils"
export default defineComponent({
  props: {
    post: {
      type: Object as PropType<LocalizedPostOrPage>,
      required: true,
    },
  },
  setup(props) {
    const post = toRef(props, "post")

    const primaryTag = computed(() => post.value.primary_tag)
    const tags = computed(() =>
      post.value.tags
        ? post.value.tags
            .filter(tag => tag.visibility === "public")
            .filter(tag =>
              primaryTag.value ? tag.id !== primaryTag.value.id : true
            )
        : []
    )

    const hasMoreTags = computed(() => tags.value.length > 0)
    return { primaryTag, hasMoreTags, tags }
  },
})
</script>
