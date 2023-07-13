import { useEffect, useState } from "react";
import { TableViewer } from "../../app/api/table-visualization";

export default function useTableViewer(alert = true) {
  const [viewer, setViewer] = useState<TableViewer>();

  useEffect(() => {
    async function load() {
      const viewerData = await window.api.getLoadedTableViewerData();
      if (!viewerData) {
        if (alert) window.alert(`a tabela ainda não foi carretada corretamente, tente recarregar o visualizador!`);
        return;
      }
      
      setViewer(new TableViewer(viewerData));
    }

    load();
  }, []);

  return viewer;
}
