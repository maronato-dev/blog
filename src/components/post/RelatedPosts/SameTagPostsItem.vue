<template>
  <li>
    <h4 class="text-base font-bold opacity-75 hover:opacity-100 transition-opacity duration-200">
      <router-link :to="{ name: 'postOrPage', params: { slug: post.slug } }">{{ post.title }}</router-link>
    </h4>
    <div>
      <time :datetime="isoDate">{{ dateString }}</time> -
      <span>{{ readingTime }}</span>
    </div>
  </li>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from "vue"
import { useI18n } from "vue-i18n"
import { LocalizedPostOrPage } from "../../../hooks/ghost/content/utils"

export default defineComponent({
  props: {
    post: {
      type: Object as PropType<LocalizedPostOrPage>,
      required: true,
    },
  },
  setup(props) {
    const i18n = useI18n()
    const isoDate = computed(() => {
      const date =
        props.post.published_at || props.post.updated_at || new Date()
      return new Date(date).toISOString()
    })

    const dateString = computed(() => {
      const d = new Date(isoDate.value)
      return i18n.d(d, "short")
    })

    const readingTime = computed(() => {
      return i18n.t("post-card.reading-time", {
        time: props.post.reading_time || 0,
      })
    })

    return { isoDate, dateString, readingTime }
  },
})
</script>