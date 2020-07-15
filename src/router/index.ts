import {
  createRouter,
  RouterOptions,
  createWebHistory,
  RouteRecordRaw,
} from "vue-router"

import Index from "../views/Index.vue"
import PageNotFound from "../views/PageNotFound.vue"
import Preview from "../views/Preview.vue"
import PostOrPage from "../views/PostOrPage.vue"
import { useError, useLayout } from "../hooks/layout"

const routes: RouteRecordRaw[] = [
  { path: "/", component: Index, name: "home" },
  { path: "/:slug", component: PostOrPage, props: true, name: "postOrPage" },
  { path: "/tag/:slug", component: Index, props: true, name: "tag" },
  { path: "/author/:slug", component: Index, props: true, name: "author" },
  { path: "/p/:uuid", component: Preview, props: true, name: "preview" },
  {
    path: "/:catchAll(.*)",
    component: PageNotFound,
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
