import React, { useEffect, useState } from 'react';
import { ExtraDutyTableV2 } from '../../extra-duty-lib';
import { HeaderLabel } from '../Generator/WorkerEditionStage.styles';

function useLoadedTable() {
  const [table, setTable] = useState<ExtraDutyTableV2>();

  useEffect(() => {
    async function load() {

    }

    load();
  });

  return table;
}

export function EditTableStage() {
  const table = useLoadedTable();

  return (
    <>
      <HeaderLabel>Edição</HeaderLabel>
    </>
  );
}