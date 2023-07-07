import React, { useEffect, useState } from 'react';
import { Footer, HeaderLabel } from '../Generator/WorkerEditionStage.styles';
import { DutyState, EditableDutyTable, EditableTableSlot, TableSlot, TableSlotMap } from '../../../app/api/table-edition/editable-table';
import styled from 'styled-components';
import { iterRange, saveFile } from '../../utils';
import { useRerender } from '../../hooks';
import { useStage } from '../../contexts/stages';
import { AppError } from '../../../app/api/channels';

function useLoadedTable() {
  const [table, setTable] = useState<EditableDutyTable>();

  useEffect(() => {
    async function load() {
      const result = await window.api.getEditableMap();

      if (result.type === 'app-error') {
        console.error(result);
        console.error(result.callstack);
        return alert(result.message);
      } else {
        const table = EditableDutyTable.from(result as TableSlotMap);

        setTable(table);
      }
    }

    load();
  }, []);

  return table;
}

function isAppError(value: unknown): value is AppError {
  return typeof value === 'object' && value !== null && 'type' in value && value.type === 'app-error';
}

export function EditTableStage() {
  const table = useLoadedTable();
  const { prev } = useStage();

  async function handleSave() {
    if (!table) return alert(`a tabela ainda não foi carretada corretamente, tente recarregar o editor!`);

    const changes = table.getChanges();
    
    const error = await window.api.saveEditorChanges(changes);

    if (error) {
      console.error(error);
      return alert(error.message);
    }

    const result = await window.api.serializeEditedTable();

    if (isAppError(result)) {
      console.error(result);
      return alert(result.message);
    }
  
    saveFile('Escalas.xlsx', result);
  }

  return (
    <EditorBody>
      <HeaderLabel>Edição de Plantões</HeaderLabel>
      {table && <TableEditionGrid table={table} />}
      <Footer>
        <input type='button' value='Voltar' onClick={prev} />
        <input type='button' value='Salvar' onClick={handleSave} />
      </Footer>
    </EditorBody>
  );
}

export interface TableEditionGridProps {
  table: EditableDutyTable;
}

export function TableEditionGrid(props: TableEditionGridProps) {
  const [currentWorker, setCurrentWorker] = useState<string>();
  const { table } = props;

  useEffect(() => {
    const firstWorker = table.names.at(0);
    if (!firstWorker) return alert(`Não foi possível encontrar nenhum nome, talvez você deva recarregar o editor!`);

    setCurrentWorker(firstWorker);
  }, [table.names]);

  function handleWorkerChange(ev: React.ChangeEvent<HTMLSelectElement>) {
    setCurrentWorker(ev.currentTarget.value);
  }

  return (
    <>
      <select onChange={handleWorkerChange}>{
        table.names.map((name, i) => <option key={i} value={name}>{name}</option>)
      }</select>
      {currentWorker && <SlotEditor table={table} workerName={currentWorker} />}
    </>
  );
}

interface SlotEditorProps {
  workerName: string;
  table: EditableDutyTable;
}

function SlotEditor(props: SlotEditorProps) {
  const rerender = useRerender();

  const { table, workerName } = props;

  const slot = table.get(workerName);
  if (!slot) return `Não foi possível encontrar o funcionário '${workerName}' na tabela!`;

  function handleChangeState(day: number, dutyIndex: number, oldState: DutyState) {
    switch (oldState) {
      case DutyState.WORK:
        table.set(workerName, day, dutyIndex, DutyState.DONT_WORK);
        break;
      case DutyState.DONT_WORK:
        table.set(workerName, day, dutyIndex, DutyState.WORK);
        break;
    }

    rerender();
  }

  return (
    <DutyDayGrid>
      {Array.from(iterRange(0, 30), (day) => {
        const state0 = slot.get(day, 0);
        const state1 = slot.get(day, 1);

        return (
          <DutyDay key={day}>
            {day + 1}
            <DutyList>
              <DutyItem
                onClick={() => handleChangeState(day, 0, state0)}
                state={state0}>
                7 as 19h
              </DutyItem>
              <DutyItem
                onClick={() => handleChangeState(day, 1, state1)}
                state={state1}>
                19 as 7h
              </DutyItem>
            </DutyList>
          </DutyDay>
        )
      })}
    </DutyDayGrid>
  );
}

interface DutyItemProps {
  state: DutyState;
}

function colorForDutyState(state: DutyState) {
  switch (state) {
    case DutyState.DONT_WORK:
      return '#d3d3d3';
    case DutyState.WORK:
      return '#297a29';
    case DutyState.NOT_EDITABLE:
      return '#64646445';
  }
}

const DutyItem = styled.div<DutyItemProps>`
  background-color: ${({ state }) => colorForDutyState(state)};
  transition: background-color 100ms;
  font-size: 10px;
  display: flex;
  color: ${({state}) => state === DutyState.WORK ? '#ffffff' : '#000'};
  justify-content: center;
  align-items: center;
  text-align: center;
  flex: 1;
  font-weight: bold;
  user-select: none;
  cursor: pointer;
  padding: .1rem;
  border-radius: .2rem;
`;

const DutyList = styled.div`
  display: flex;
  gap: .2rem;
  flex: 1;
`;

const DutyDay = styled.div`
  width: 60px;
  height: 50px;
  flex-direction: column;
  display: flex;
  background-color: #dde2dd;
  user-select: none;
  padding: .2rem;
  border-radius: .2rem;
`;

const DutyDayGrid = styled.div`
  display: grid;
  gap: .2rem;
  grid-template-columns: repeat(7, 1fr);
  background-color: #49494942;
  padding: .2rem;
  border-radius: .2rem;
`;

const EditorBody = styled.section`
  display: flex;
  flex-direction: column;
  flex: 1;
  align-items: center;
  gap: .4rem;
`;