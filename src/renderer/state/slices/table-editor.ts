import {
  DutyAndWorkerRelationship,
  IdGenerator,
  ScheduleState,
  TableFactory,
} from "../../../apploader/api/table-reactive-edition/table";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { WorkerInsertionRulesState } from "../../../apploader/api/table-edition";

export interface TableEditorState {
  history: ScheduleState[];
  undoIndex: number;
}

export interface PushStatePayload {
  tableData: ScheduleState;
}

export interface AddRelationshipPayload {
  workerId: number;
  dutyId: number;
}

export interface RemoveRelationshipPayload {
  id: number;
}

export interface RemoveRelationshipsPayload {
  ids: Iterable<number>;
}

export interface SetRulePayload {
  rule: keyof WorkerInsertionRulesState;
  value: boolean;
}

export interface InitializerPayload {
  tableData: ScheduleState;
}

const initialState: TableEditorState = {
  undoIndex: 0,
  history: [],
};

const HISTORY_CAPACITY = 256;

export function pushToHistory(state: TableEditorState, newData: ScheduleState) {
  state.history = [
    newData,
    ...(state.undoIndex === 0
      ? state.history
      : state.history.slice(state.undoIndex)),
  ].slice(0, HISTORY_CAPACITY);

  state.undoIndex = 0;

  return newData;
}

export const tableEditorSlice = createSlice({
  name: "table-editor",
  initialState,
  reducers: {
    clear() {
      return initialState;
    },
    initialize(state, action: PayloadAction<InitializerPayload>) {
      state.history = [action.payload.tableData];
      state.undoIndex = 0;
    },
    pushState(state, action: PayloadAction<PushStatePayload>) {
      pushToHistory(state as TableEditorState, action.payload.tableData);
    },
    addRelationship(state, action: PayloadAction<AddRelationshipPayload>) {
      const current = currentTableSelector(state as TableEditorState);
      if (current === null) return;

      const idGenerator = new IdGenerator(current.idCounters);
      const tableFactory = new TableFactory(idGenerator);

      const newRelationship = tableFactory.createDutyAndWorkerRelationship(
        action.payload.workerId,
        action.payload.dutyId,
      );

      const newData: ScheduleState = {
        ...current,
        dutyAndWorkerRelationships: [
          ...current.dutyAndWorkerRelationships,
          newRelationship,
        ],
      };

      pushToHistory(state as TableEditorState, newData);
    },
    removeRelationship(
      state,
      action: PayloadAction<RemoveRelationshipPayload>,
    ) {
      const current = currentTableSelector(state as TableEditorState);
      if (current === null) return;

      const newData: ScheduleState = {
        ...current,
        dutyAndWorkerRelationships: current.dutyAndWorkerRelationships.filter(
          (relationship) => relationship.id !== action.payload.id,
        ),
      };

      pushToHistory(state as TableEditorState, newData);
    },
    removeRelationships(
      state,
      action: PayloadAction<RemoveRelationshipsPayload>,
    ) {
      const current = currentTableSelector(state as TableEditorState);
      if (current === null) return;

      const ids = Array.from(action.payload.ids);

      const newData: ScheduleState = {
        ...current,
        dutyAndWorkerRelationships: current.dutyAndWorkerRelationships.filter(
          (relationship) => !ids.includes(relationship.id),
        ),
      };

      pushToHistory(state as TableEditorState, newData);
    },
    setRule(state, action: PayloadAction<SetRulePayload>) {
      const current = currentTableSelector(state as TableEditorState);
      if (current === null) return;

      current.rules = {
        ...current.rules,
        [action.payload.rule]: action.payload.value,
      };
    },
    undo(state) {
      const lastIndex = state.history.length - 1;

      if (state.undoIndex >= lastIndex) {
        state.undoIndex = lastIndex;

        return;
      }

      state.undoIndex++;
    },
    redo(state) {
      if (state.undoIndex <= 0) {
        state.undoIndex = 0;

        return;
      }

      state.undoIndex--;
    },
  },
});

export const editorActions = tableEditorSlice.actions;

export type StateSelector<S, R> = (state: S) => R;

export function tableEditorSelector(state: RootState): TableEditorState {
  return state.tableEditor;
}

export function currentTableSelector(
  state: TableEditorState,
): ScheduleState | null {
  return state.history.at(state.undoIndex) ?? null;
}

export function relationshipsSelector(
  state: RootState,
): DutyAndWorkerRelationship[] {
  const current = currentTableSelector(tableEditorSelector(state));
  if (current === null) throw new Error(`Table editor has't initialized yet!`);

  return current.dutyAndWorkerRelationships;
}

export function relationshipSelector(
  id: number,
): StateSelector<RootState, DutyAndWorkerRelationship | undefined> {
  return (state) =>
    relationshipsSelector(state).find((relationship) => relationship.id === id);
}

export function dutyRelationshipsSelector(
  dutyId: number,
): StateSelector<RootState, DutyAndWorkerRelationship[]> {
  return (state) =>
    relationshipsSelector(state).filter(
      (relationship) => relationship.dutyId === dutyId,
    );
}

export function workerRelationship(
  workerId: number,
): StateSelector<RootState, DutyAndWorkerRelationship[]> {
  return (state) =>
    relationshipsSelector(state).filter(
      (relationship) => relationship.workerId === workerId,
    );
}
