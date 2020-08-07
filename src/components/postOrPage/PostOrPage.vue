<template>
  <page v-if="content.page" :page="content" />
  <post v-else :post="content" />
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import { LocalizedPostOrPage } from "../../hooks/ghost/content/utils"
import Post from "./post/Post.vue"
import Page from "./page/Page.vue"

export default defineComponent({
  components: { Page, Post },
  props: {
    content: {
      type: Object as PropType<LocalizedPostOrPage>,
      required: true,
    },
  },
})
</script>
