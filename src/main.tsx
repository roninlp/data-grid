import { GlideDataGrid, Index, Root } from "@/routes";
import {
  RootRoute,
  Route,
  Router,
  RouterProvider,
} from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

const rootRoute = new RootRoute({
  component: Root,
});

const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Index,
});

const glideRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/glide",
  component: GlideDataGrid,
});

// const rdgRoute = new Route({
//   getParentRoute: () => rootRoute,
//   path: "/rdg",
//   component: ReactDataGrid,
// });

// const cdgRoute = new Route({
//   getParentRoute: () => rootRoute,
//   path: "/cdg",
//   component: CanvasDataGrid,
// });

const routeTree = rootRoute.addChildren([
  indexRoute,
  glideRoute,
  // rdgRoute,
  // cdgRoute,
]);

const router = new Router({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
