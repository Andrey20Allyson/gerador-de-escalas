import { useEffect, useState } from "react";
import { TableEditor } from "../../app/api/table-edition";

export default function useTableViewer(alert = true) {
  const [viewer, setViewer] = useState<TableEditor>();

  useEffect(() => {
    async function load() {
      
      const viewerData = await window.api.getLoadedTableViewerData();
      if (!viewerData) {
        if (alert) window.alert(`a tabela ainda não foi carretada corretamente, tente recarregar o visualizador!`);
        return;
      }
      
      setViewer(new TableEditor(viewerData));
    }

    load();
  }, []);

  return viewer;
}
