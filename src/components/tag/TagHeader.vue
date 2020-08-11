<template>
  <header
    class="flex justify-around flex-row mx-auto pt-12 flex-wrap items-center"
  >
    <div
      class="flex-col flex items-center xl:items-start justify-center mx-auto order-1 xl:mx-0 xl:pl-8 xl:order-2 xl:w-1/2"
    >
      <h1
        class="mb-1 mt-1 leading-tight text-5xl md:text-6xl font-medium title my-8 text-center lg:text-left"
      >
        {{ tag.name }}
      </h1>
      <div
        class="flex flex-row justify-center text-base my-8 font-bold flex-wrap"
      >
        <span>{{ totalText }}</span>
      </div>
      <p
        v-if="tag.description"
        class="mb-5 text-xl lg:text-2xl font-light max-w-screen-sm opacity-75 ghost-body-font"
      >
        {{ tag.description }}
      </p>
    </div>
    <figure
      v-if="tag.feature_image"
      class="flex flex-row items-center overflow-hidden rounded-md shadow-md order-2 max-w-screen-md xl:order-1 xl:w-1/2"
    >
      <img
        class="h-auto w-full"
        :srcset="getSrcset(tag.feature_image)"
        loading="lazy"
        :src="getImageUrl(tag.feature_image, 'm')"
        :alt="tag.name"
      />
    </figure>
    <div
      v-else-if="tag.accent_color"
      class="flex flex-row items-center overflow-hidden rounded-md shadow-md order-2 max-w-screen-md xl:order-1 xl:w-1/2"
      :style="{ backgroundColor: tag.accent_color }"
    >
      <div class="h-0" :style="{ paddingTop: '56.25%' }">
        {{ tag.accent_color }}
      </div>
    </div>
  </header>
  <hr class="dark:opacity-25 opacity-75 my-10" />
</template>

<script lang="ts">
import { defineComponent, PropType, toRef, computed } from "vue"
import { useI18n } from "vue-i18n"
import { getImageUrl, getSrcset } from "../collections/PostFeed/imageUtils"
import { LocalizedPublicTag } from "../../hooks/ghost/content/utils"

export default defineComponent({
  props: {
    tag: {
      type: Object as PropType<LocalizedPublicTag>,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const total = toRef(props, "total")
    const i18n = useI18n()

    const totalText = computed(() =>
      i18n.t("tag.header.colletion-total", total.value)
    )

    return {
      getImageUrl,
      getSrcset,
      totalText,
    }
  },
})
</script>
