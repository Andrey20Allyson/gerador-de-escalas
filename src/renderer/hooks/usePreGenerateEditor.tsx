import { PreGenerateEditor } from "../../apploader/api/table-generation/pre-generate-editor";
import { AppError, api } from "../api";
import { useEffect, useState } from "react";

export default function usePreGenerateEditor() {
  const [editor, setData] = useState<PreGenerateEditor>();

  useEffect(() => {
    async function load() {
      const response = await api.generator.preGenerateEditor.getEditor();
      if (!response.ok) return AppError.log(response.error);

      const editor = new PreGenerateEditor(response.data);

      setData(editor);
    }

    load();
  }, []);

  return editor;
}
