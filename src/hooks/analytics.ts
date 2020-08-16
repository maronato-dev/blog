import ackee from "ackee-tracker"
import { createGlobalStateAlt } from "./vueuse"
import { useGlobalOnline } from "./online"

export const useAckee = createGlobalStateAlt(() => {
  const domainId = import.meta.env.VITE_ANALYTICS_SITE_ID as string
  const server = import.meta.env.VITE_ANALYTICS_URL as string
  const tracker = ackee.create(
    {
      domainId,
      server,
    },
    {
      ignoreLocalhost: import.meta.env.PROD,
      detailed: true,
    }
  )

  return tracker
})

export const useAnalytics = () => {
  const tracker = useAckee()
  const online = useGlobalOnline()

  const trackPageview = () => {
    if (online.value) {
      tracker.record()
    }
  }

  return { trackPageview }
}
