import { DutyAndWorkerRelationship, IdGenerator, TableData, TableFactory } from "../../../app/api/table-reactive-edition/table";
import { createSlice, PayloadAction, } from "@reduxjs/toolkit";
import type { RootState } from "../store";

export interface TableEditorState {
  history: TableData[];
  undoIndex: number;
}

export interface AddRelationshipPayload {
  workerId: number;
  dutyId: number;
}

export interface RemoveRelationshipPayload {
  id: number;
}

export interface InitializerPayload {
  tableData: TableData;
}

const initialState: TableEditorState = {
  undoIndex: 0,
  history: [],
};

export function pushToHistory(state: TableEditorState, newData: TableData) {
  state.history = [
    newData,
    ...state.undoIndex === 0
      ? state.history
      : state.history.slice(state.undoIndex),
  ];

  state.undoIndex = 0;

  return newData;
}

export function canUndo(state: TableEditorState) {
  return state.undoIndex < state.history.length;
}

export function canRedo(state: TableEditorState) {
  return state.undoIndex > 0;
}

export const tableEditorSlice = createSlice({
  name: 'table-editor',
  initialState,
  reducers: {
    clear() {
      return initialState;
    },
    initialize(state, action: PayloadAction<InitializerPayload>) {
      state.history = [action.payload.tableData];
      state.undoIndex = 0;
    },
    addRelationship(state, action: PayloadAction<AddRelationshipPayload>) {
      const current = currentTableSelector(state);
      if (current === null) return;

      const idGenerator = new IdGenerator(current.idCounters);
      const tableFactory = new TableFactory(idGenerator);

      const newRelationship = tableFactory
        .createDutyAndWorkerRelationship(
          action.payload.workerId,
          action.payload.dutyId
        );

      const newData: TableData = {
        ...current,
        dutyAndWorkerRelationships: [
          ...current.dutyAndWorkerRelationships,
          newRelationship,
        ]
      };

      pushToHistory(state, newData);
    },
    removeRelationship(state, action: PayloadAction<RemoveRelationshipPayload>) {
      const current = currentTableSelector(state);
      if (current === null) return;

      const newData: TableData = {
        ...current,
        dutyAndWorkerRelationships: current.dutyAndWorkerRelationships.filter(relationship => relationship.id !== action.payload.id)
      }

      pushToHistory(state, newData);
    },
    undo(state) {
      if (!canUndo(state)) return;

      state.undoIndex++;
    },
    redo(state) {
      if (!canRedo(state)) return;

      state.undoIndex--;
    }
  }
});

export const editorActions = tableEditorSlice.actions;

export type StateSelector<S, R> = (state: S) => R;

export function tableEditorSelector(state: RootState): TableEditorState {
  return state.tableEditor;
}

export function currentTableSelector(state: TableEditorState): TableData | null {
  return state.history.at(state.undoIndex) ?? null;
}

export function relationshipsSelector(state: RootState): DutyAndWorkerRelationship[] {
  const current = currentTableSelector(tableEditorSelector(state));
  if (current === null) throw new Error(`Table editor has't initialized yet!`);

  return current.dutyAndWorkerRelationships;
}

export function relationshipSelector(id: number): StateSelector<RootState, DutyAndWorkerRelationship | undefined> {
  return state => relationshipsSelector(state)
    .find((relationship) => relationship.id === id);
}

export function dutyRelationshipsSelector(dutyId: number): StateSelector<RootState, DutyAndWorkerRelationship[]> {
  return state => relationshipsSelector(state)
    .filter(relationship => relationship.dutyId === dutyId);
}

export function workerRelationship(workerId: number): StateSelector<RootState, DutyAndWorkerRelationship[]> {
  return state => relationshipsSelector(state)
    .filter(relationship => relationship.workerId === workerId);
}