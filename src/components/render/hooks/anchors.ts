import { ref, onMounted, getCurrentInstance } from "vue"

const anchorHeadings = (el: HTMLElement) => {
  el.querySelectorAll("h1,h2,h3,h4").forEach(heading => {
    const anchor = document.createElement("a")
    anchor.setAttribute("class", "heading-anchor")
    anchor.setAttribute("href", `#${heading.id}`)
    anchor.textContent = "#"
    heading.appendChild(anchor)
  })
}

export const useHeadingAnchors = () => {
  const hasAnchors = ref(false)
  console.log("USING ANCHORS", hasAnchors.value)
  onMounted(() => {
    console.log("MOUNTING ANCHORS", hasAnchors.value)
    const vm = getCurrentInstance()
    if (!vm) throw "Component instance not available!"

    let el = vm.vnode.el as HTMLElement
    if (el) {
      el = el.parentNode as HTMLElement
    }
    if (!hasAnchors.value) {
      console.log("CREATING ANCHORS", hasAnchors.value)
      anchorHeadings(el)
      hasAnchors.value = true
    }
  })
}
