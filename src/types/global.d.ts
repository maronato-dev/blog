declare interface Window {
  MathJax: {
    typeset(): void
    texReset(): void
    config: {
      tex: {
        inlineMath?: string[][]
        tags?: string
      }
    }
    startup: {
      getComponents(): void
      document: {
        state(s: number): void
      }
    }
  }
  commento: {
    main(): void
  }
}
