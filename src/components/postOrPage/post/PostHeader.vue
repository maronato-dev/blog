<template>
  <header
    class="flex justify-around flex-row mx-auto pt-12 flex-wrap items-center"
  >
    <div
      class="flex-col flex items-center xl:items-start justify-center mx-auto order-1 xl:mx-0 xl:pl-8 xl:order-2 xl:w-1/2"
    >
      <section v-if="post.primary_tag">
        <router-link
          class="mt-0 mb-2 text-primary-400 dark:text-primary-300 font-semibold uppercase animated-underline opacity-100 text-base"
          :to="`/tag/${post.primary_tag.slug}`"
        >
          {{ post.primary_tag.name }}
        </router-link>
      </section>
      <h1
        class="mb-1 mt-1 leading-tight text-5xl md:text-6xl font-medium title my-8 text-center lg:text-left"
      >
        {{ post.title }}
      </h1>
      <div
        class="flex flex-row justify-center text-base my-8 font-bold flex-wrap"
      >
        <time
          class="flex-grow w-full md:w-auto text-center mb-2 md:mb-0"
          :datetime="isoDate"
        >
          {{ dateString }}
        </time>
        <span
          class="mx-3 opacity-50 font-normal text-xl leading-6 hidden md:block"
        >
          /
        </span>
        <span>{{ readingTime }}</span>
        <template v-if="online">
          <span class="mx-3 opacity-50 font-normal text-xl leading-6">/</span>
          <span
            class="cursor-pointer flex flex-row justify-between group items-center"
            @click="likeOnce"
          >
            <span
              class="transition-opacity duration-500 likes-number"
              :class="{ 'opacity-0': loadingLikes }"
            >
              {{ likes }}
            </span>
            <div
              class="ml-1 transition-all duration-300 group-hover:scale-125 active:scale-125 transform"
              :class="{ 'scale-125': liked }"
            >
              <component
                :is="likeIcon"
                class="h-5 w-6 text-red-600 fill-current"
              />
            </div>
          </span>
        </template>
      </div>
      <p
        v-if="post.custom_excerpt"
        class="mb-5 text-xl lg:text-2xl font-light max-w-screen-sm opacity-75 ghost-body-font"
      >
        {{ post.custom_excerpt }}
      </p>
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
import { useI18n } from "vue-i18n"
import { usePostLikes } from "../../../hooks/likes"
import { getImageUrl, getSrcset } from "../../collections/PostFeed/imageUtils"
import { LocalizedPostOrPage } from "../../../hooks/ghost/content/utils"
import { useGlobalOnline } from "../../../hooks/online"
import IconHeart from "../../ui/Icons/IconHeart.vue"
import IconHeartEmpty from "../../ui/Icons/IconHeartEmpty.vue"

export default defineComponent({
  components: { IconHeartEmpty, IconHeart },
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
      return i18n.d(d, "medium")
    })

    const readingTime = computed(() => {
      return i18n.t("post-card.reading-time", {
        time: props.post.reading_time || 0,
      })
    })

    const slug = computed(() => props.post.slug)
    const { likes, like, liked, loading: loadingLikes } = usePostLikes(slug)
    const likeIcon = computed(() =>
      liked.value ? "icon-heart" : "icon-heart-empty"
    )
    const likeOnce = () => {
      if (!liked.value) {
        like()
      }
    }

    const online = useGlobalOnline()

    return {
      isoDate,
      dateString,
      readingTime,
      likeIcon,
      likes,
      likeOnce,
      liked,
      getImageUrl,
      getSrcset,
      loadingLikes,
      online,
    }
  },
})
</script>
<style lang="postcss" scoped>
.likes-number {
  font-variant-numeric: tabular-nums lining-nums;
}
</style>
