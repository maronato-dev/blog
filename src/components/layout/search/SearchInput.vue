<template>
  <div class="group w-full">
    <div class="flex items-center border-b border-teal-500 py-2">
      <input
        ref="inputRef"
        v-model="value"
        class="appearance-none bg-transparent w-full border-none mr-3 pb-1 px-2 leading-tight focus:outline-none"
        type="text"
        :placeholder="placeholder"
        :aria-label="placeholder"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed, onMounted } from "vue"
import { useI18n } from "vue-i18n"

export default defineComponent({
  props: {
    query: {
      type: String,
      required: true,
    },
  },
  emits: {
    "update:query": (query: string) => typeof query === "string",
  },
  setup(_, { emit }) {
    const inputRef = ref<HTMLElement | null>(null)
    const value = ref("")
    watch(value, v => emit("update:query", v))

    const i18n = useI18n()
    const placeholder = computed(() => i18n.t("navbar.search.placeholder"))

    onMounted(() => {
      if (inputRef.value) {
        inputRef.value.focus()
      }
    })

    return { value, placeholder, inputRef }
  },
})
</script>
