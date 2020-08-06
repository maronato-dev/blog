import { ref, computed, Ref } from "vue"
import { createGlobalStateAlt } from "./vueuse"
import { useMeta } from "./meta"
import { useGlobalOnline } from "./online"

export const useFathom = () => {
  const fathom = ref<Window["fathom"]>(undefined)

  const defaultFathom = function () {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line prefer-rest-params
    ;(window.fathom.q = window.fathom.q || []).push(arguments)
  }

  if (!window.fathom) {
    // Initialize fathom to use built in queue
    window.fathom = defaultFathom
  }

  const loadedFathom = computed(() => {
    const loaded =
      typeof fathom.value !== "undefined" && fathom.value !== defaultFathom
    console.log("loaded fathon", loaded)
    return loaded
  })

  const getTimeoutFathom = (retry = 5) => {
    fathom.value = window.fathom
    if (retry > 0 && !loadedFathom.value) {
      setTimeout(() => {
        getTimeoutFathom(retry - 1)
      }, 200)
    }
  }

  getTimeoutFathom()

  return fathom as Ref<NonNullable<Fathom>>
}

const useFathomInitialized = createGlobalStateAlt(() => ref(false))

const buildTrackParams = (): {
  path: string
  hostname: string
  referrer: string
} => {
  const req = window.location
  const path = req.pathname + req.search || "/"
  const hostname = req.protocol + "//" + req.hostname
  let referrer = ""
  if (document.referrer.indexOf(hostname) < 0) {
    referrer = document.referrer
  }
  return { path, hostname, referrer }
}

export const useAnalytics = () => {
  const fathom = useFathom()
  const initialized = useFathomInitialized()
  const { script } = useMeta()
  const online = useGlobalOnline()

  const initAnalytics = (siteId?: string) => {
    const viteFathomSiteId = import.meta.env.VITE_FATHOM_SITE_ID
    if (
      typeof siteId === "undefined" &&
      viteFathomSiteId &&
      typeof viteFathomSiteId === "string"
    ) {
      siteId = viteFathomSiteId
    }
    if (siteId && !initialized.value) {
      fathom.value("set", "siteId", siteId)
      if (online.value) {
        const scriptValue = script.value || []
        scriptValue.push({
          src: `${import.meta.env.VITE_FATHOM_URL}/tracker.js`,
          async: 1,
          id: "fathom-script",
          permanent: true,
        })
        script.value = scriptValue
      }
      initialized.value = true
    }
  }

  const trackPageview = () => {
    if (online.value) {
      fathom.value("trackPageview", buildTrackParams())
    }
  }

  // init on load
  if (!initialized.value) {
    initAnalytics()
  }

  return { trackPageview }
}
