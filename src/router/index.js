import { createRouter, createWebHistory } from "vue-router";
import Home from "@/pages/Home.vue";
import Sentry from "@/pages/Sentry.vue";
import Error from "@/pages/Error.vue";

const allowedQueryParams = [
  "sessionId",
  "purpose",
  "subPurpose",
  "redirectTo",
  "redirectID",
  "group",
];

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    props: (route) => ({
      purpose: route.query.purpose,
      purposeParams: route.query.subPurpose,
      redirectTo: route.query.redirectTo,
      redirectID: route.query.redirectID,
      group: route.query.group,
      authType: route.query.authType,
      sessionId: route.query.sessionId,
    }),
  },
  {
    path: "/404-not-found",
    name: "Error",
    props: { type: "404" },
    component: Error,
  },
  {
    path: "/sentry",
    name: "Sentry",
    component: Sentry,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  mode: "history",
});

/** Check if correct query params exist */
router.beforeEach((to) => {
  const queryParams = Object.keys(to.query);
  const validQueryParams = queryParams.every((queryParam) =>
    allowedQueryParams.includes(queryParam)
  );

  if (!validQueryParams) {
    return {
      name: "Error",
    };
  }
});

export default router;
