import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

import Layout from "@/layouts";
import Create from "@/pages/create";
import Error from "@/pages/error";
import Favorite from "@/pages/favorite";
import History from "@/pages/history";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Mylist from "@/pages/mylists";
import Practice from "@/pages/practice";
import ResetPassword from "@/pages/reset-password";
import Search from "@/pages/search";
import Setting from "@/pages/setting";
import Welcome from "@/pages/welcome";
import Workbooks from "@/pages/workbook";
import WorkbookDetail from "@/pages/workbook-detail";

const rootRoute = createRootRoute({
  component: Layout,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const welcomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/welcome",
  component: Welcome,
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/search",
  component: Search,
});

const practiceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/practice",
  component: Practice,
  validateSearch: (search: Record<string, unknown>) => ({
    path: typeof search.path === "string" ? search.path : undefined,
  }),
});

const favoriteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/favorite",
  component: Favorite,
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/history",
  component: History,
});

const createPageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/create",
  component: Create,
});

const mylistRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/mylist/$mid",
  component: Mylist,
});

const workbookRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/workbook",
  component: Workbooks,
});

const workbookDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/workbook/$wid",
  component: WorkbookDetail,
});

const settingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/setting",
  component: Setting,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
});

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reset-password",
  component: ResetPassword,
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  component: Error,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  welcomeRoute,
  searchRoute,
  practiceRoute,
  favoriteRoute,
  historyRoute,
  createPageRoute,
  mylistRoute,
  workbookRoute,
  workbookDetailRoute,
  settingRoute,
  loginRoute,
  resetPasswordRoute,
  notFoundRoute,
]);

export const router = createRouter({
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
