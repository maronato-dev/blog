import { reactive, Ref } from "vue"
import axios from "axios"

export const useSubscribe = (emailRef: Ref<string>) => {
  const state = reactive({
    pending: false,
    error: null as Error | null,
    success: false,
  })
  const subscribe = async () => {
    state.pending = true
    state.error = null
    state.success = false
    try {
      await axios({
        url: "/members/api/send-magic-link/",
        method: "POST",
        data: {
          email: emailRef.value,
          emailType: "subscribe",
        },
      })
      state.success = true
    } catch (e) {
      state.error = e
    } finally {
      state.pending = false
    }
  }
  return subscribe
}
