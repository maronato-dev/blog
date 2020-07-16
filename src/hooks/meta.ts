import {
  reactive,
  toRefs,
  watch,
  onBeforeUnmount,
  provide,
  inject,
  InjectionKey,
  ref,
  Ref,
  isRef,
  getCurrentInstance,
  ComponentInternalInstance,
  ToRefs,
} from "vue"

interface LinkAttrs {
  rel?: string
  href?: string
  id?: string
}
interface StyleAttrs {
  cssText?: string
  type?: string
  id?: string
}
interface MetaAttrs {
  name?: string
  content?: string
  property?: string
  id?: string
  multiple?: boolean
}
interface ScriptAttrs {
  src?: string
  type?: string
  id?: string
}
interface BodyAttrs {
  class?: string
}
type Title = string

type Links = LinkAttrs[]
type Styles = StyleAttrs[]
type Metas = MetaAttrs[]
type Scripts = ScriptAttrs[]

interface Head {
  bodyAttrs: BodyAttrs | null
  title: Title | null
  link: Links | null
  style: Styles | null
  meta: Metas | null
  script: Scripts | null
}

type HeadTags = Exclude<keyof Head, "bodyAttrs" | "title">

interface Nodeset {
  bodyAttrs?: BodyAttrs
  title?: Title
  link?: HTMLElement[]
  style?: HTMLElement[]
  meta?: HTMLElement[]
  script?: HTMLElement[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Dictionary = { [key: string]: any }

const metaMap = new WeakMap<ComponentInternalInstance, Head>()
const HeadInjectKey: InjectionKey<() => void> = Symbol("useHead")

const unproxy = (obj: unknown) => JSON.parse(JSON.stringify(obj))

export const useMeta = () => {
  // 1. create current reactive object
  // 2. get parent node set
  // 3. remove own nodeset and generate tags from current reactive

  // 4. At every update, redo 3

  // 5. before unmount, remove own and parent's nodeset and recreate parent's

  const vm = getCurrentInstance()
  if (!vm) throw "useMeta must be called inside setup()"
  console.log("meta")

  let head: Head
  let nodeset: Ref<Nodeset>
  let headRefs: ToRefs<Head>

  if (metaMap.has(vm)) {
    head = metaMap.get(vm) as Head
    headRefs = toRefs(head)
  } else {
    head = reactive<Head>({
      title: null,
      bodyAttrs: null,
      link: null,
      style: null,
      meta: null,
      script: null,
    })
    metaMap.set(vm, head)
    nodeset = ref<Nodeset>({})

    const previousTitle = document.title
    const parentUpdate = inject(
      HeadInjectKey,
      () => (document.title = previousTitle)
    )

    const update = () => {
      console.log(vm, "calling update with head", unproxy(head))
      removeNodeset(nodeset.value)
      nodeset.value = createNodeset(head)
    }
    // Provide own update method
    provide(HeadInjectKey, update)

    const cleanup = () => {
      console.log(vm, "cleaning up nodeset", unproxy(nodeset.value))
      removeNodeset(nodeset.value)
      parentUpdate()
    }
    onBeforeUnmount(cleanup)

    headRefs = toRefs(head)
    watch(Object.values(headRefs), update, { immediate: true })
  }
  return headRefs
}

export const useTitle = (defaultTitle?: string | Ref<string>) => {
  const { title } = useMeta()
  if (defaultTitle) {
    if (isRef(defaultTitle)) {
      watch(defaultTitle, () => (title.value = defaultTitle.value), {
        immediate: true,
      })
    } else {
      title.value = defaultTitle
    }
  }
  return title
}

const removeAttributes = (el: HTMLElement, attrs: Dictionary) => {
  Object.keys(attrs).forEach(attr => el.removeAttribute(attr))
}

const removeNodeset = (nodeset: Nodeset) => {
  Object.entries(nodeset).forEach(([nodeType, value]) => {
    if (nodeType === "bodyAttrs") {
      const attrs = value as Nodeset["bodyAttrs"]
      if (attrs) {
        console.log("Removing body attrs", unproxy(attrs))
        removeAttributes(document.body, attrs)
      }
    } else if (nodeType !== "title") {
      const nodes = value as HTMLElement[] | undefined
      if (nodes) {
        nodes.forEach(node => node.remove())
      }
    }
  })
}

const setAttributes = (el: Element, attrs: Dictionary) => {
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value))
}

const getById = (attrs: { id?: string }): Element | null => {
  return attrs.id ? document.getElementById(attrs.id) : null
}

const getMetaElement = (meta: MetaAttrs) => {
  if (meta.multiple) {
    return null
  }
  const byName = meta.name
    ? document.querySelector(`meta[name~="${meta.name}"]`)
    : null
  const byProperty = meta.property
    ? document.querySelector(`meta[property~="${meta.property}"]`)
    : null
  return byName || byProperty
}

const createNodeset = (head: Head) => {
  const nodeset: Nodeset = {}
  Object.entries(head).forEach(([key, value]) => {
    if (key === "bodyAttrs") {
      const attrs = value as Head["bodyAttrs"]
      if (attrs) {
        console.log("Setting body attrs", unproxy(attrs))
        setAttributes(document.body, attrs)
        nodeset.bodyAttrs = attrs
      }
    } else if (key === "title") {
      const title = value as Head["title"]
      if (title) {
        console.log("updating title to", title)
        document.title = title
        nodeset.title = title
      }
    } else {
      const nodes = value as Dictionary[] | null
      if (nodes) {
        nodeset[key as HeadTags] = nodes.map(node => {
          let el = getById(node)
          if (!el && key === "meta") {
            el = getMetaElement(node)
          }
          if (!el) {
            el = document.createElement(key)
          }
          setAttributes(el, node)
          document.head.appendChild(el)
          return el as HTMLElement
        })
      }
    }
  })
  return nodeset
}
