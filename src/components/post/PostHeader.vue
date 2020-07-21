<template>
  <header class="flex justify-around flex-row mx-auto mt-32 flex-wrap items-center">
    <div
      class="flex-col flex items-center xl:items-start justify-center mx-auto order-1 xl:mx-0 xl:pl-8 xl:order-2 xl:w-1/2"
    >
      <section v-if="post.primary_tag">
        <router-link
          class="mt-0 mb-2 text-primary-400 dark:text-primary-300 font-semibold uppercase animated-underline opacity-100 text-base"
          :to="`/tag/${post.primary_tag.slug}`"
        >{{ post.primary_tag.name }}</router-link>
      </section>
      <h1
        class="mb-1 mt-1 leading-tight text-5xl md:text-6xl font-medium title my-8 text-center lg:text-left"
      >{{ post.title }}</h1>
      <div class="flex flex-row justify-center text-base my-8 font-bold flex-wrap">
        <time
          class="flex-grow w-full md:w-auto text-center mb-2 md:mb-0"
          :datetime="isoString"
        >{{ dateString }}</time>
        <span class="mx-3 opacity-50 font-normal text-xl leading-6 hidden md:block">/</span>
        <span>{{ readingTime }}</span>
        <span class="mx-3 opacity-50 font-normal text-xl leading-6">/</span>
        <span
          class="cursor-pointer flex flex-row justify-between group items-center"
          @click="toggleLike"
        >
          {{ likes }}
          <img
            class="h-5 text-red-600 ml-2 fill-current transition-all duration-300 group-hover:scale-125 active:scale-125 transform"
            :class="{ 'scale-125': liked }"
            :src="likeIcon"
          />
        </span>
      </div>
      <p
        v-if="post.custom_excerpt"
        class="mb-5 text-xl lg:text-2xl font-light max-w-screen-sm opacity-75 excerpt"
      >{{ post.custom_excerpt }}</p>
    </div>
    <figure
      v-if="post.feature_image"
      class="flex flex-row items-center overflow-hidden rounded-md shadow-md order-2 max-w-screen-md xl:order-1 xl:w-1/2"
    >
      <img
        class="h-auto w-full"
        :srcset="getSrcset(post.feature_image)"
        loading="lazy"
        :src="getImageUrl(post.feature_image, 'm')"
        :alt="post.title"
      />
    </figure>
  </header>
  <hr class="dark:opacity-25 opacity-75 my-10" />
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from "vue"
import { PostOrPage } from "@tryghost/content-api"
import { useI18n } from "vue-i18n"
import HeartIcon from "../../assets/img/icons/heart.svg"
import EmptyHeartIcon from "../../assets/img/icons/heart-empty.svg"
import { usePostLikes } from "../../hooks/likes"
import { getImageUrl, getSrcset } from "../collections/PostFeed/imageUtils"

export default defineComponent({
  props: {
    post: {
      type: Object as PropType<PostOrPage>,
      required: true,
    },
  },
  setup(props) {
    const i18n = useI18n()
    const isoDate = computed(() => {
      const date =
        props.post.updated_at || props.post.published_at || new Date()
      return new Date(date).toISOString()
    })

    const dateString = computed(() => {
      const d = new Date(isoDate.value)
      return i18n.d(d, "medium")
    })

    const readingTime = computed(() => {
      return i18n.t("post-card.reading-time", {
        time: props.post.reading_time || 0,
      })
    })

    const nonLocalizedSlug = computed(() =>
      props.post.slug.startsWith(`${i18n.locale.value}-`)
        ? props.post.slug.substr(i18n.locale.value.length + 1)
        : props.post.slug
    )
    const { likes, toggleLike, liked } = usePostLikes(nonLocalizedSlug.value)
    const likeIcon = computed(() => (liked.value ? HeartIcon : EmptyHeartIcon))

    return {
      isoDate,
      dateString,
      readingTime,
      likeIcon,
      likes,
      toggleLike,
      liked,
      getImageUrl,
      getSrcset,
    }
  },
})
</script>
<style lang="postcss" scoped>
.excerpt {
  font-family: "Merriweather", Georgia, Cambria, "Times New Roman", Times, serif;
}
</style>