<template>
  <figure ref="wrapperRef" class="kg-card kg-embed-card">
    <slot>
      <component :is="defaultPlayer" />
    </slot>
  </figure>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  computed,
  h,
  ref,
  onUnmounted,
  Ref,
  onBeforeMount,
  watch,
  onBeforeUnmount,
} from "vue"
import type Plyr from "plyr"
import { useMeta } from "../../../hooks/meta"
import { useIntersectionObserver } from "../../../hooks/intersectionObserver"

declare interface Window {
  Plyr: import("plyr")
}

type Provider = "youtube" | "vimeo" | "none"
type EmbedId = string

function usePlyr(playerRef: Ref<Element | null>) {
  // Register script and link tags while
  // https://github.com/sampotts/plyr/pull/1914
  // is not resolved
  const { script, link } = useMeta()
  onBeforeMount(() => {
    const linkValue = link.value ? link.value : []
    linkValue.push({
      id: "plyr-stylesheet",
      rel: "stylesheet",
      href: "https://cdn.plyr.io/3.6.2/plyr.css",
    })
    link.value = linkValue
  })
  onBeforeMount(() => {
    const scriptValue = script.value ? script.value : []
    scriptValue.push({
      id: "plyr-script",
      src: "https://cdn.plyr.io/3.6.2/plyr.js",
    })
    script.value = scriptValue
  })

  const plyrRef = ref<Plyr | null>(null)
  const initPlyr = () => {
    setTimeout(() => {
      if (window.Plyr) {
        const PlyrClass = window.Plyr
        if (playerRef.value && !plyrRef.value) {
          plyrRef.value = new PlyrClass(playerRef.value as HTMLElement, {
            quality: {
              default: 720,
              options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240],
            },
            controls: [
              "play",
              "progress",
              "current-time",
              "duration",
              "volume",
              "captions",
              "settings",
              "pip",
              "airplay",
              "download",
              "fullscreen",
            ],
          })
        }
      }
    }, 100)
  }
  onUnmounted(() => {
    if (plyrRef.value) {
      plyrRef.value.destroy()
    }
  })

  return { initPlyr, plyrRef }
}

export default defineComponent({
  props: {
    provider: {
      type: String as PropType<Provider>,
      required: false,
      default: "none",
    },
    embedId: {
      type: String as PropType<EmbedId>,
      required: false,
      default: "none",
    },
  },
  setup(props) {
    const wrapperRef = ref<HTMLElement | null>(null)
    const playerRef = computed(() =>
      wrapperRef.value ? wrapperRef.value.firstElementChild : null
    )

    const { initPlyr, plyrRef } = usePlyr(playerRef)
    const { isIntersecting } = useIntersectionObserver(wrapperRef)

    // Only init plyr once it is being intersected
    const stopInitPlyrWatch = watch(isIntersecting, () => {
      if (!plyrRef.value) {
        initPlyr()
      }
    })
    // Once plyr is initialized, stop watching for it
    watch(plyrRef, value => value && stopInitPlyrWatch())

    // After it is initialized, auto toggle pip
    watch(isIntersecting, () => {
      if (plyrRef.value) {
        if (!isIntersecting.value && plyrRef.value.playing) {
          // if not intersecting and playing, activate pip
          plyrRef.value.pip = true
        } else {
          // else, deactivate it
          plyrRef.value.pip = false
        }
      }
    })

    // Make sure pip is disabled before unmounting
    onBeforeUnmount(() => {
      if (plyrRef.value) {
        plyrRef.value.pip = false
      }
    })

    const defaultPlayer = computed(() =>
      h("div", {
        "data-plyr-provider": props.provider,
        "data-plyr-embed-id": props.embedId,
      })
    )
    return { defaultPlayer, wrapperRef }
  },
})
</script>
<style lang="postcss" scoped>
.kg-embed-card {
  @apply block;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
}
</style>
<style lang="postcss">
.plyr__video-wrapper {
  & video {
    margin: unset;
  }
}
.plyr__controls {
  & a.plyr__controls__item.plyr__control {
    @apply text-white transition-all duration-300;
    &:hover {
      @apply opacity-100;
    }
  }
}
</style>
