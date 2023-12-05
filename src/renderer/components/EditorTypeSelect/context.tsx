import { TableEditor } from "@gde/app/api/table-edition";
import { api, AppError } from "@gde/renderer/api";
import { DutyTableGrid } from "@gde/renderer/components/DutyTableGrid";
import { createRouterContext, InferRoutes, RouterContext, RoutesLike } from "@gde/renderer/contexts/router";
import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { WorkerList } from "../WorkerList";
import { NotSelected } from "./utils";
import { TableDataResponse } from "@gde/renderer/hooks/useTableData";

export interface EditorContext {
  tableResponse: TableDataResponse | undefined;
  setTableResponse: (table: TableDataResponse | undefined) => void;
}

export function createEditorContext<R extends RoutesLike>(RouterContext: RouterContext<R>) {
  const ctx = createContext<EditorContext | null>(null);

  function Provider(props: PropsWithChildren) {
    const [tableResponse, setTableResponse] = useState<TableDataResponse>();

    return (
      <ctx.Provider value={{
        setTableResponse,
        tableResponse,
      }}>
        <RouterContext.RouterProvider>
          {props.children}
        </RouterContext.RouterProvider>
      </ctx.Provider>
    )
  }

  function useEditorContext() {
    const _ctx = useContext(ctx);
    if (!_ctx) throw new Error(`Can't use EditorContext outside a Provider`);

    return _ctx;
  }

  function useEditor() {
    const { setTableResponse, tableResponse } = useEditorContext();

    useEffect(() => {
      async function load() {
        const response = await api.editor.createEditor();
        if (!response.ok) {
          const { error } = response;

          setTableResponse({ status: 'error', error });
          return;
        }

        const editor = new TableEditor(response.data);

        setTableResponse({ status: 'success', editor });
      }

      if (tableResponse === undefined) load();
    }, []);

    if (tableResponse === undefined) return null;

    if (tableResponse.status === 'error') throw new Error(AppError.stringify(tableResponse.error));

    return tableResponse.status === 'success' ? tableResponse.editor : null;
  }

  function useClearEditor() {
    const { setTableResponse } = useEditorContext();

    return async () => {
      setTableResponse(undefined);
      await api.editor.clear();
    }
  }

  function useEditorOrThrow() {
    const editor = useEditor();
    if (editor === null) throw new Error(`Editor has't loaded yet`);

    return editor;
  }

  const {
    useNavigate,
    useRoute,
    Router,
  } = RouterContext;

  return {
    Router,
    useRoute,
    Provider,
    useEditor,
    useNavigate,
    useEditorOrThrow,
    useClearEditor,
  };
}

export const EditorRouterContext = createRouterContext({
  DutyTableGrid,
  NotSelected,
  WorkerList,
}, 'NotSelected', {});

export const EditorContext = createEditorContext(EditorRouterContext);

export type Routes = InferRoutes<typeof EditorRouterContext>;