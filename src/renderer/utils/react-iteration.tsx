import React from "react";
import { enumerate } from ".";

export const entryPropKey = "entry";
export type EntryPropKey = typeof entryPropKey;
export type IterProps<T, P extends {} = {}> = Omit<P, EntryPropKey> & {
  [K in EntryPropKey]: T;
};

export interface ElementListPropsWithCommunProps<T, P extends {}> {
  iter: Iterable<T>;
  communProps: Omit<P, EntryPropKey>;
  reducer?: (props: IterProps<T, P>, index: number) => IterProps<T, P>;
  Component: (props: IterProps<T, P>) => React.JSX.Element;
}

export interface ElementListPropsWithOutCommunProps<T, P extends {}> {
  iter: Iterable<T>;
  reducer?: (props: IterProps<T, P>, index: number) => IterProps<T, P>;
  Component: (props: IterProps<T, P>) => React.JSX.Element;
}

export type ElementListProps<T, P extends {}> =
  Exclude<keyof P, "entry"> extends never
    ? ElementListPropsWithOutCommunProps<T, P>
    : ElementListPropsWithCommunProps<T, P>;

export function ElementList<T, P extends {}>(props: ElementListProps<T, P>) {
  const { Component, iter, reducer, communProps } =
    props as IterElementsOptions<T, P>;

  return (
    <>{Array.from(iterElements({ Component, iter, communProps, reducer }))}</>
  );
}

export function* iterWithProps<T, P extends {}>(
  iter: Iterable<T>,
  props?: P,
): Iterable<IterProps<T, P>> {
  if (props) {
    for (const entry of iter) {
      yield { ...props, [entryPropKey]: entry };
    }

    return;
  }

  for (const entry of iter) {
    yield { [entryPropKey]: entry } as IterProps<T, P>;
  }
}

export interface IterElementsOptions<T, P extends {}> {
  iter: Iterable<T>;
  communProps?: P;
  reducer?: (props: IterProps<T, P>, index: number) => IterProps<T, P>;
  Component: (props: IterProps<T, P>, index: number) => React.JSX.Element;
}

export function* iterElements<T, P extends {}>(
  options: IterElementsOptions<T, P>,
): Iterable<React.JSX.Element> {
  const { Component, communProps, iter, reducer } = options;

  for (const [index, props] of enumerate(iterWithProps(iter, communProps))) {
    const finalProps = reducer ? reducer(props, index) : props;

    yield <Component key={index} {...finalProps} />;
  }
}
