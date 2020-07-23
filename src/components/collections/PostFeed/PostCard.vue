<template>
  <article
    class="post-card group"
    :class="{ large, 'no-image': !post.feature_image, 'border-b': !noBorder }"
  >
    <router-link
      v-if="post.feature_image"
      :to="{ name: 'postOrPage', params: { slug: post.slug } }"
      class="relative block overflow-hidden rounded-lg shadow-md group-hover:shadow-lg translate-y-0 group-hover:-translate-y-2 dark-group-hover:opacity-100 transform transition-all duration-200 image-link delay-150"
    >
      <img
        class="w-full h-64 object-cover image"
        :srcset="getSrcset(post.feature_image)"
        loading="lazy"
        :src="getImageUrl(post.feature_image, 'm')"
        :alt="post.title"
      />
    </router-link>

    <div class="flex-grow flex flex-col content">
      <router-link :to="{ name: 'postOrPage', params: { slug: post.slug } }" class="relative block">
        <header class="mt-4 mx-0 mb-3">
          <router-link
            v-if="post.primary_tag"
            class="mt-0 mb-2 text-primary-400 dark:text-primary-300 font-semibold uppercase animated-underline opacity-100 text-sm"
            :to="{ name: 'tag', params: { slug: post.primary_tag.slug } }"
          >{{ post.primary_tag.name }}</router-link>
          <h2 class="mb-1 mt-1 leading-tight text-2xl font-medium title">{{ post.title }}</h2>
        </header>

        <section class="excerpt text-gray-700 dark:text-gray-500">
          <p>{{ exerpt }}</p>
        </section>
      </router-link>

      <footer class="flex items-start p-0">
        <div
          class="flex-grow flex-shrink flex mt-1 mb-2 mx-0 text-xs leading-6 font-normal tracking-wider uppercase text-gray-600"
        >
          <time :datetime="isoDate">{{ dateString }}</time>
          <span class="inline-block mx-1 my-0 opacity-50">•</span>
          {{ readingTime }}
        </div>
      </footer>
    </div>
  </article>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from "vue"
import { useI18n } from "vue-i18n"
import { getImageUrl, getSrcset } from "./imageUtils"
import { LocalizedPostOrPage } from "../../../hooks/ghost/content/utils"

export default defineComponent({
  props: {
    post: {
      type: Object as PropType<LocalizedPostOrPage>,
      required: true,
    },
    large: Boolean,
    noBorder: Boolean,
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

    const exerpt = computed(() => {
      const words = (
        props.post.custom_excerpt ||
        props.post.excerpt ||
        ""
      ).split(" ")
      const maxWords = props.large ? 44 : 30
      if (words.length > maxWords) {
        const phrase = words.slice(0, maxWords).join(" ")
        if (phrase[phrase.length - 1] === ".") {
          return phrase + ".."
        }
        return phrase + "..."
      }
      return words.join(" ")
    })

    return {
      dateString,
      isoDate,
      readingTime,
      exerpt,
      getImageUrl,
      getSrcset,
    }
  },
})
</script>

<style lang="postcss">
.post-card {
  & .excerpt {
    max-width: 56em;
    font-family: "Merriweather", Georgia, Cambria, "Times New Roman", Times,
      serif;
  }

  @apply relative flex-grow flex-shrink flex flex-col border-gray-600 border-opacity-25 bg-cover pt-0 px-6 pb-8 mt-0 mx-0 mb-8;
  flex-basis: 21rem;
  min-height: 14rem;

  &.no-image {
    & .content {
      padding: 0 !important;
    }
    & .title {
      margin-top: 0;
    }
  }

  @screen md {
    &.large {
      flex-basis: 100%;
      @apply flex-row border-t-0;
      min-height: 18rem;
      & .image-link {
        position: relative;
        flex: 1 1 auto;
        margin-bottom: 0;
        min-height: 380px;
      }
      & .image {
        position: absolute;
        width: 100%;
        height: 100%;
      }
      & .content {
        flex: 0 1 361px;
        justify-content: center;
        padding-left: 2.5rem;
      }
      & .title {
        margin-top: 0;
        font-size: 2rem;
      }
    }
  }
}
</style>