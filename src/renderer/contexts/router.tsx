import React, { JSX, PropsWithChildren, createContext, useContext, useState } from "react";

export interface RouterInnerContext<TRoutes extends RoutesLike> {
  setCurrentRoute: (route: RouteState<TRoutes>) => void;
  currentRoute: RouteState<TRoutes>;
  routes: TRoutes;
}

export type RoutesLike = {
  [K in string | symbol]: ((props: any) => JSX.Element) | (() => JSX.Element);
};

export type InferProps<T> = T extends (props: infer P) => JSX.Element ? P extends object ? P : {} : {};

export interface RouteState<R extends RoutesLike, N extends keyof R = keyof R> {
  is<TRoute extends N>(name: TRoute): this is RouteState<R, TRoute>;
  props: InferProps<R[N]>;
  name: N;
}

type PropsArgs<T> = keyof T extends never ? [] : [props: T];

export interface RouterContext<TRoutes extends RoutesLike> {
  useNavigate(): <TRoute extends keyof TRoutes>(route: TRoute, ...args: PropsArgs<InferProps<TRoutes[TRoute]>>) => void;
  RouterProvider(props: PropsWithChildren): JSX.Element;
  Router(): JSX.Element;
  useRoute(): RouteState<TRoutes>;
}

export function createRouteState<R extends RoutesLike, K extends keyof R = keyof R>(name: K, props: InferProps<R[K]>): RouteState<R, K> {
  const thisName = name;
  
  return {
    props,
    name,

    is(name) {
      return thisName === name;
    },
  } as RouteState<R, K>;
}

export type InferRouteNames<T extends RouterContext<any>> = T extends RouterContext<infer R> ? keyof R : never;
export type InferRoutes<T extends RouterContext<any>> = T extends RouterContext<infer R> ? R : never;

export function createRouterContext<TRoutes extends RoutesLike, TIRoute extends keyof TRoutes>(
  routes: TRoutes,
  initialRoute: TIRoute,
  initialProps: InferProps<TRoutes[TIRoute]>,
): RouterContext<TRoutes> {
  const context = createContext<RouterInnerContext<TRoutes> | null>(null);
  const { Provider } = context;

  function RouterProvider(props: PropsWithChildren) {
    const [currentRoute, setCurrentRoute] = useState<RouteState<TRoutes>>(createRouteState(initialRoute, initialProps));

    return (
      <Provider value={{ routes, currentRoute, setCurrentRoute }}>
        {props.children}
      </Provider>
    );
  }

  function Router() {
    const { currentRoute, routes } = useRoutes();
    const { props, name: route } = currentRoute;

    const Route = routes[route];

    return <Route {...props} />
  }

  function useRoutes() {
    const routerContext = useContext(context);
    if (!routerContext) throw new Error(`to access RouterInnerContex the element shold be child of RouterProvider!`);

    return routerContext;
  }

  function useNavigate() {
    const { setCurrentRoute } = useRoutes();

    return <TRoute extends keyof TRoutes>(route: TRoute, ...[props]: PropsArgs<InferProps<TRoutes[TRoute]>>) => {
      return setCurrentRoute(createRouteState(route, props ?? {} as InferProps<TRoutes[TIRoute]>));
    }
  }

  function useRoute() {
    const { currentRoute } = useRoutes();

    return currentRoute;
  }

  return { RouterProvider, Router, useNavigate, useRoute };
}