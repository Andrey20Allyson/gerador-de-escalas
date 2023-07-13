import { useEffect, useState } from "react";
import { TableViewer } from "../../app/api/table-visualization";

export default function useTableViewer() {
  const [viewer, setViewer] = useState<TableViewer>();

  useEffect(() => {
    async function load() {
      const viewerData = await window.api.getLoadedTableViewerData();
      if (!viewerData) return alert(`a tabela ainda não foi carretada corretamente, tente recarregar o visualizador!`);

      setViewer(new TableViewer(viewerData));
    }

    load();
  }, []);

  return viewer;
}
