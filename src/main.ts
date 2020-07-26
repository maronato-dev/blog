import { createApp } from "vue"
import { createI18n } from "vue-i18n"
import App from "./App.vue"
import router from "./router"
import pt from "./locales/pt.json"
import en from "./locales/en.json"
import { useLocaleState } from "./hooks/locale/index"
import { availableLocales } from "./hooks/locale/util"
import "./index.css"

const i18n = () => {
  const locale = useLocaleState()
  return createI18n({
    locale: locale.value,
    fallbackLocale: "en",
    inheritLocale: true,
    availableLocales,
    messages: {
      pt,
      en,
    },
    datetimeFormats: {
      pt: {
        short: {
          year: "numeric",
          month: "short",
          day: "numeric",
        },
        medium: {
          year: "numeric",
          month: "long",
          day: "numeric",
        },
        long: {
          year: "numeric",
          month: "short",
          day: "numeric",
          weekday: "short",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        },
      },
      en: {
        short: {
          year: "numeric",
          month: "short",
          day: "numeric",
        },
        medium: {
          year: "numeric",
          month: "long",
          day: "numeric",
        },
        long: {
          year: "numeric",
          month: "short",
          day: "numeric",
          weekday: "short",
          hour: "numeric",
          minute: "numeric",
        },
      },
    },
  })
}

const app = createApp(App)

app.use(router)
app.use(i18n())

app.use(appContext => {
  appContext.directive("click-outside", {
    beforeMount(el, binding) {
      el.clickOutsideEvent = function (event: Event) {
        // here I check that click was outside the el and his childrens
        if (!(el == event.target || el.contains(event.target))) {
          // and if it did, call method provided in attribute value
          binding.value(event)
        }
      }
      document.body.addEventListener("click", el.clickOutsideEvent)
    },
    unmounted(el) {
      document.body.removeEventListener("click", el.clickOutsideEvent)
    },
  })
})

app.mount("#app")
