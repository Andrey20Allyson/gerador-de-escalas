import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface TableEditorLoaderInitialState {
  path: string | null;
}

const initialState: TableEditorLoaderInitialState = {
  path: null,
};

export const tableEditorLoaderSlice = createSlice({
  name: "table-editor-loader",
  initialState,
  reducers: {
    setPath(state, payload: PayloadAction<string>) {
      state.path = payload.payload;
    },
  },
});

export const editorLoaderActions = tableEditorLoaderSlice.actions;

export function currentTablePath(state: RootState) {
  return state.tableEditorLoader.path;
}
