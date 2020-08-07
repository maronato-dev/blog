import { onMounted } from "vue"

export const useMathjax = () => {
  onMounted(() => {
    window.MathJax.config.tex.inlineMath = [
      ["$", "$"],
      ["\\(", "\\)"],
    ]
    window.MathJax.config.tex.tags = "ams"
    window.MathJax.startup.getComponents()
    window.MathJax.startup.document.state(0)
    window.MathJax.texReset()
    window.MathJax.typeset()
  })
}
