import { ref } from "vue"
import { useGhostDatabase } from "."

export const useDBReady = () => {
  const db = useGhostDatabase()
  const ready = ref(db.isOpen())

  db.on("ready", () => {
    ready.value = db.isOpen()
  })

  return ready
}
