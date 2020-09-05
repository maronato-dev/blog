import { defineAsyncComponent } from "vue"
import {
  createRouter,
  RouterOptions,
  createWebHistory,
  RouteRecordRaw,
} from "vue-router"

import { useError, useLayout } from "../hooks/layout"
import LoadingComponent from "../components/ui/LoadingContent.vue"
import { availableLocales } from "../hooks/locale/util"

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "index",
    component: defineAsyncComponent({
      loader: () => import("../views/IndexView.vue"),
      loadingComponent: LoadingComponent,
    }),
    alias: availableLocales.map(locale => `/${locale}`),
  },
  {
    path: "/:slug",
    props: true,
    name: "postOrPage",
    component: defineAsyncComponent({
      loader: () => import("../views/PostOrPageView.vue"),
      loadingComponent: LoadingComponent,
    }),
  },
  {
    path: "/tag/:slug",
    props: true,
    name: "tag",
    component: defineAsyncComponent({
      loader: () => import("../views/TagView.vue"),
      loadingComponent: LoadingComponent,
    }),
  },
  {
    path: "/author/:slug",
    props: true,
    name: "author",
    component: defineAsyncComponent({
      loader: () => import("../views/IndexView.vue"),
      loadingComponent: LoadingComponent,
    }),
  },
  {
    path: "/p/:uuid",
    props: true,
    name: "preview",
    component: defineAsyncComponent({
      loader: () => import("../views/PreviewView.vue"),
      loadingComponent: LoadingComponent,
    }),
  },
  {
    path: "/:catchAll(.*)",
    component: defineAsyncComponent({
      loader: () => import("../views/PageNotFoundView.vue"),
      loadingComponent: LoadingComponent,
    }),
    name: "notFound",
    meta: {
      layout: "error",
      error: { code: 404, message: "layout.error.404-message" },
    },
  },
]

const history = createWebHistory()
const routerOptions: RouterOptions = {
  history,
  routes,
  scrollBehavior: async (to, from, savedPosition) => {
    if (to.hash) {
      return { el: to.hash, behavior: "smooth" } as ReturnType<
        NonNullable<RouterOptions["scrollBehavior"]>
      >
    }
    if (savedPosition) {
      return savedPosition as ReturnType<
        NonNullable<RouterOptions["scrollBehavior"]>
      >
    }
    if (to.fullPath === from.fullPath) {
      return
    }
    return { top: 0, left: 0, behavior: "smooth" } as ReturnType<
      NonNullable<RouterOptions["scrollBehavior"]>
    >
  },
}

const router = createRouter(routerOptions)

router.afterEach(async (to, _) => {
  const { layout } = useLayout()
  const { triggerError } = useError()
  if (to.meta.layout && to.meta.layout !== "default") {
    layout.value = to.meta.layout
    if (to.meta.error) {
      triggerError(to.meta.error)
    }
  } else if (layout.value === "error") {
    layout.value = "default"
  }
})

export default router
