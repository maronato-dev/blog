function fathom(
  cmd: "set",
  config: "siteId" | "trackerUrl",
  value: string
): void
function fathom(
  cmd: "trackPageview",
  vars?: { path?: string; hostname?: string; referrer?: string }
): void
function fathom(cmd: "setTrackerUrl", value: string): void
declare type Fathom = typeof fathom
declare type FathonQueue = { q: Parameters<Fathom>[] }

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
  fathom: Fathom | FathonQueue | undefined
}
