import React, { createContext, useState, JSX, useContext, Component, PropsWithChildren } from "react";

interface RouterContext<TRoutes extends RoutesLike> {
  setCurrentRoute: (route: RouteState<TRoutes, keyof TRoutes>) => void;
  currentRoute: RouteState<TRoutes, keyof TRoutes>;
  routes: TRoutes;
}

export type RoutesLike = {
  [K in string | symbol]: () => JSX.Element;
};

export type InferProps<T> = T extends (props: infer P) => JSX.Element ? P : never;

export type RouteState<R extends RoutesLike, K extends keyof R> = {
  name: K,
  props: InferProps<R[K]>;
}

export function createRouterContext<TRoutes extends RoutesLike, TIRoute extends keyof TRoutes>(
  routes: TRoutes,
  initialRoute: TIRoute,
  initialProps: InferProps<TRoutes[TIRoute]>,
) {
  const context = createContext<RouterContext<TRoutes> | null>(null);
  const { Provider } = context;

  function RouterProvider(props: PropsWithChildren) {
    const [currentRoute, setCurrentRoute] = useState<RouteState<TRoutes, keyof TRoutes>>({ name: initialRoute, props: initialProps});

    return (
      <Provider value={{ routes, currentRoute, setCurrentRoute }}>
        {props.children}
      </Provider>
    );
  }

  function Router() {
    const { currentRoute, routes } = useRoutes();

    const Route: () => JSX.Element = routes[currentRoute.name];

    return <Route {...currentRoute.props as {}} />
  }

  function useRoutes() {
    const routerContext = useContext(context);
    if (!routerContext) throw new Error(`to access RouterContex the element shold be child of RouterProvider!`);

    return routerContext;
  }

  function navigate<TRoute extends keyof TRoutes>(route: TRoute, props: TRoutes[TRoute]) {

  }

  return { RouterProvider, Router, navigate };
}

const { Router, RouterProvider, navigate } = createRouterContext({
  oi: () => <></>,
  tchau: () => <></>,
}, 'oi', {})