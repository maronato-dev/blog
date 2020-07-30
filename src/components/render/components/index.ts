import PostFootnote from "./PostFootnote.vue"
import PostReference from "./PostReference.vue"
import PostReferences from "./PostReferences.vue"
import Plyr from "./Plyr.vue"

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

  Plyr,
  Player: Plyr,
}

export default components
