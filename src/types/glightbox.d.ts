interface GlightBoxOptions {
  selector?: string
  openEffect: "zoom" | "fade" | "none"
  closeEffect: "zoom" | "fade" | "none"
  slideEffect: "slide" | "zoom" | "fade" | "none"
}

interface GlightBox {
  reload(): void
  destroy(): void
}

declare module "glightbox" {
  const GlightBoxFactory: new (GlightBoxOptions) => GlightBox
  export default GlightBoxFactory
}
