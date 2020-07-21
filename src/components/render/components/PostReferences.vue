<script lang="ts">
import { defineComponent, h, Slot, VNode } from "vue"
export default defineComponent((_, { slots }) => {
  const slot = slots.default as Slot
  const references = slot().reduce((agg, ref) => {
    if (agg.length === 0) {
      return [ref]
    }
    return [...agg, h("sup", ","), ref]
  }, [] as VNode[])
  return () => h("div", { class: "post-references" }, references)
})
</script>
<style lang="postcss">
.post-references {
  display: contents;
  & sup {
    @apply mx-0;
    &:last-child {
      @apply mr-1;
    }
  }
}
</style>
