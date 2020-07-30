<template>
  <div
    :id="id"
    class="mx-auto justify-center w-full md:w-3/4 lg:w-2/3 xl:w-1/2 commento-root-wrapper"
  ></div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue"
import { useMeta, ScriptAttrs } from "../../hooks/meta"

export default defineComponent(() => {
  const { script } = useMeta()

  const id = "commento"
  const domain = import.meta.env.VITE_DOMAIN
  const commentoScript = {
    id: "commentoScript",
    src: `//commento.${domain}/js/commento.js`,
    "data-auto-init": "false",
    "data-id-root": id,
    "data-no-fonts": "true",
  } as ScriptAttrs

  const scriptArray = script.value || []
  scriptArray.push(commentoScript)
  script.value = scriptArray

  const initCommento = (retry = 5) => {
    setTimeout(() => {
      if (window.commento.main) {
        window.commento.main()
      } else {
        initCommento(retry - 1)
      }
    }, 100)
  }

  onMounted(() => {
    initCommento()
  })

  return { id }
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
