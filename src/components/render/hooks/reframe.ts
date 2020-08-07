import { ref, getCurrentInstance, onMounted } from "vue"
import reframe from "reframe.js"

const reframeEmbeds = (el: HTMLElement) => {
  const selectors = [
    "iframe[src*='player.vimeo.com']",
    "iframe[src*='youtube.com']",
    "iframe[src*='youtube-nocookie.com']",
    "iframe[src*='kickstarter.com'][src*='video.html']",
    "object",
    "embed",
  ]
  for (const selector of selectors) {
    reframe(el.querySelectorAll(selector))
  }
}

export const useReframe = () => {
  const reframed = ref(false)
  onMounted(() => {
    const vm = getCurrentInstance()
    if (!vm) throw "Component instance not available!"

    let el = vm.vnode.el as HTMLElement
    if (el) {
      el = el.parentNode as HTMLElement
    }
    if (!reframed.value) {
      reframeEmbeds(el)
    }
  })
}
