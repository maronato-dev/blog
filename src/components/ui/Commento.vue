<template>
  <loading-spinner v-if="loading" />
  <div
    :id="id"
    ref="target"
    class="ghost-content-container commento-root-wrapper"
  />
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue"
import { useIntersectionObserver } from "../../hooks/intersectionObserver"
import LoadingSpinner from "./LoadingSpinner.vue"
import "./commento"

export default defineComponent({
  components: { LoadingSpinner },
  setup() {
    const id = "commento"
    const loading = ref(true)

    const target = ref<Element | null>(null)
    const { isIntersecting, disconnect } = useIntersectionObserver(target, {
      rootMargin: "200px",
    })

    const initCommento = () => {
      disconnect()
      window.commento.main(() => {
        loading.value = false
      }, (import.meta.env.VITE_COMMENTO_URL || "").toString())
    }

    watch(isIntersecting, initCommento)

    return { id, target, loading }
  },
})
</script>
<style lang="postcss">
.commento-root-wrapper {
  & .commento-card {
    @apply p-3 rounded shadow-md bg-gray-100 bg-opacity-25 overflow-hidden;
  }
  & .commento-login-box {
    @apply rounded-md;
  }
  @nest .dark-mode & {
    &.commento-root * {
      @apply text-gray-200;
    }
    & textarea {
      @apply bg-gray-900;
    }
    & .commento-markdown-help {
      @apply bg-gray-900 border border-gray-800;
    }
    & .commento-login-box-container .commento-login-box {
      @apply bg-gray-800;
      & hr {
        @apply bg-gray-900;
      }
      & .commento-login-box-close {
        &::before, &::after {
          @apply bg-gray-500;
        }
      }
      & .commento-email-container .commento-email {
        &, & .commento-input, & .commento-email-button {
          @apply bg-gray-900 border-gray-800;
        }
      }
    }
    & .commento-anonymous-checkbox-container input[type="checkbox"] + label {
      @apply text-gray-500;
    }
    & .commento-option-button.commento-option-collapse {
      @apply text-gray-400 bg-gray-400;
    }
    & .commento-logged-container .commento-logged-in-as .commento-name {
      @apply text-gray-200;
    }
    & .commento-card {
      @apply bg-gray-900 border-gray-800;
    }
  }
}
</style>
