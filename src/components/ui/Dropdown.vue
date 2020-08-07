<template>
  <div
    v-click-outside="clickOutside"
    class="relative inline-block text-left z-20 capitalize"
  >
    <div>
      <span class="rounded">
        <button
          id="options-menu"
          type="button"
          class="inline-flex justify-center w-full rounded py-2 opacity-75 hover:opacity-100 text-sm leading-5 font-medium focus:outline-none focus:shadow-outline-blue active:bg-gray-50 transition-opacity ease-in-out duration-200"
          aria-haspopup="true"
          aria-expanded="true"
          @click="toggle"
        >
          <div class="text-2xl leading-5">
            {{ selected.icon || selected.text }}
          </div>
          <svg
            class="-mr-1 ml-2 h-5 w-5 transform transition-transform duration-200"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </span>
    </div>
    <transition appear name="dropdown">
      <div v-if="show" class="absolute mt-2 w-auto rounded dropdown">
        <div class="rounded-md bg-gray-100 dark:bg-gray-800 shadow-lg">
          <div
            class="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            <div
              v-for="option in options"
              :key="option.value"
              class="px-4 py-2 text-sm leading-5 hover:bg-gray-200 dark-hover:bg-gray-900 focus:bg-gray-200 cursor-pointer flex"
              @click="change(option.value)"
            >
              <div v-if="option.icon" class="text-lg leading-5">
                {{ option.icon }}
              </div>
              <div class="text-sm leading-5 ml-2">{{ option.text }}</div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from "vue"

export default defineComponent({
  props: {
    selected: {
      type: Object as PropType<{ text: string; value: unknown; icon?: string }>,
      required: true,
    },
    options: {
      type: Array as PropType<
        Array<{ text: string; value: unknown; icon?: string }>
      >,
      required: true,
    },
  },
  emits: {
    change: (_value: unknown) => true,
  },
  setup(_props, { emit }) {
    const show = ref(false)
    const toggle = () => (show.value = !show.value)
    const close = () => (show.value = false)

    const clickOutside = () => {
      if (show.value) {
        close()
      }
    }

    const change = (value: unknown) => {
      emit("change", value)
      close()
    }

    return { toggle, show, clickOutside, change }
  },
})
</script>
<style scoped lang="postcss">
.dropdown {
  left: -1rem;
}
.dropdown-enter-active {
  transition: all 100ms ease-out;
}
.dropdown-leave-active {
  transition: all 75ms ease-in;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 100;
  transform: scale(1);
}
</style>
