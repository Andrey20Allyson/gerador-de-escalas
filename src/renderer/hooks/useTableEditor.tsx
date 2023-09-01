import { useEffect, useState } from "react";
import { TableEditor } from "../../app/api/table-edition";
import { AppError, ErrorCode, api } from "../api";

export type UseTableEditorResponse = {
  status: 'loading';
} | {
  status: 'error';
  error: AppError<ErrorCode.DATA_NOT_LOADED>;
} | {
  status: 'success';
  editor: TableEditor;
};

export default function useTableEditor(): UseTableEditorResponse {
  const [result, setResult] = useState<UseTableEditorResponse>({ status: 'loading' });

  useEffect(() => {
    async function load() {
      const response = await api.editor.getEditor();
      if (!response.ok) {
        const { error } = response;

        setResult({ status: 'error', error });
        return;
      } 

      const editor = new TableEditor(response.data);

      setResult({ status: 'success', editor });
    }

    load();
  }, []);

  return result;
}
