<template>
  <div>Error {{ code }}</div>
  <div>{{ message }}</div>
  <router-link to="/">Go back</router-link>
</template>

<script lang="ts">
import { defineComponent, computed, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useLayout } from "../hooks/layout"
import { useFormattedTitle } from "../hooks/ghost/content"
import { useMeta } from "../hooks/meta"

export default defineComponent({
  name: "ErrorLayout",
  setup() {
    const { error } = useLayout()
    const i18n = useI18n()
    const { title } = useMeta()
    watch(title, () => console.log("changed title", title.value))

    const code = computed(() => (error.value ? error.value.code : 500))
    const message = computed(() =>
      i18n.t(error.value ? error.value.message : "layout.error.500-message")
    )
    useFormattedTitle(message)
    return { code, message }
  },
})
</script>

<style>
</style>