import GhostContentAPI from "@tryghost/content-api"

export const useGhostContentApi = () => {
  const api = new GhostContentAPI({
    url: import.meta.env.VITE_GHOST_API_URL as string,
    key: import.meta.env.VITE_GHOST_API_KEY as string,
    version: "v3",
  })
  return api
}
