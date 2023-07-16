import { useEffect, useState } from "react";
import { TableEditor } from "../../app/api/table-edition";
import { AppError, api } from "../api";

export default function useTableViewer() {
  const [viewer, setViewer] = useState<TableEditor>();

  useEffect(() => {
    async function load() {
      const response = await api.editor.getEditor();
      if (!response.ok) return AppError.log(response.error);

      const editor = new TableEditor(response.data);
      
      setViewer(editor);
    }

    load();
  }, []);

  return viewer;
}
