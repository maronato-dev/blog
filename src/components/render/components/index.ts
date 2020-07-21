import PostFootnote from "./PostFootnote.vue"
import PostReference from "./PostReference.vue"
import PostReferences from "./PostReferences.vue"

const components = {
  PostFootnote,
  Footnote: PostFootnote,
  Foot: PostFootnote,

  PostReference,
  Reference: PostReference,
  Ref: PostReference,

  PostReferences,
  References: PostReferences,
  Refs: PostReferences,
}

export default components
