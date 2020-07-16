import { defineAsyncComponent } from "vue"
import {
  createRouter,
  RouterOptions,
  createWebHistory,
  RouteRecordRaw,
} from "vue-router"

import { useError, useLayout } from "../hooks/layout"
import LoadingComponent from "../components/ui/LoadingContent.vue"

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: defineAsyncComponent({
      loader: () => import("../views/Index.vue"),
      loadingComponent: LoadingComponent,
    }),
  },
  {
    path: "/:slug",
    props: true,
    name: "postOrPage",
    component: defineAsyncComponent({
      loader: () => import("../views/PostOrPage.vue"),
      loadingComponent: LoadingComponent,
    }),
  },
  {
    path: "/tag/:slug",
    props: true,
    name: "tag",
    component: defineAsyncComponent({
      loader: () => import("../views/Index.vue"),
      loadingComponent: LoadingComponent,
    }),
  },
  {
    path: "/author/:slug",
    props: true,
    name: "author",
    component: defineAsyncComponent({
      loader: () => import("../views/Index.vue"),
      loadingComponent: LoadingComponent,
    }),
  },
  {
    path: "/p/:uuid",
    props: true,
    name: "preview",
    component: defineAsyncComponent({
      loader: () => import("../views/Preview.vue"),
      loadingComponent: LoadingComponent,
    }),
  },
  {
    path: "/:catchAll(.*)",
    component: defineAsyncComponent({
      loader: () => import("../views/PageNotFound.vue"),
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
