import { TableData } from "../../apploader/api/table-reactive-edition/table";
import { useEffect, useState } from "react";
import { AppError, AppResponse, ErrorCode, api } from "../api";

export type TableDataResponse =
  | {
      status: "loading";
    }
  | {
      status: "error";
      error: AppError<ErrorCode.DATA_NOT_LOADED>;
    }
  | {
      status: "success";
      data: TableData;
    };

export function useTableData() {
  const [data, setData] = useState<TableDataResponse>({ status: "loading" });

  useEffect(() => {
    async function getTable() {
      const resp = await api.editor.createEditor();

      if (resp.ok) {
        setData({ status: "success", data: resp.data });
      } else {
        setData({ status: "error", error: resp.error });
      }
    }

    getTable();
  }, []);

  return data;
}
