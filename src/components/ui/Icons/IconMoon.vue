<template>
  <icon-base>
    <svg
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  </icon-base>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import IconBase from "./IconBase.vue"
export default defineComponent({
  components: { IconBase },
})
</script>
