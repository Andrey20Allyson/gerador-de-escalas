import React, { createContext, PropsWithChildren } from "react";
import { RoutesLike, RouterContext, createRouterContext, InferRoutes } from "../../contexts/router";
import { useTableEditor } from "../../hooks";
import { UseTableEditorResponse } from "../../hooks/useTableEditor";
import { DutyTableGrid } from "../DutyTableGrid";
import { WorkerList } from "../WorkerList";
import { NotSelected } from "./utils";

export interface EditorContext<R extends RoutesLike> {
  routerContext: RouterContext<R>;
  tableEditorResponse: UseTableEditorResponse;
}

export function createEditorContext<R extends RoutesLike>(routerContext: RouterContext<R>) {
  const ctx = createContext<EditorContext<R> | null>(null);

  function Provider(props: PropsWithChildren) {
    const tableEditorResponse = useTableEditor();

    return (
      <ctx.Provider value={{
        routerContext,
        tableEditorResponse,
      }}>
        {props.children}
      </ctx.Provider>
    )
  }

  function useEditor() {

  }

  return { Provider, useEditor };
}

export const EditorRouterContext = createRouterContext({
  DutyTableGrid,
  NotSelected,
  WorkerList,
}, 'NotSelected', {});

export const EditorContext = createEditorContext(EditorRouterContext);

export type Routes = InferRoutes<typeof EditorRouterContext>;