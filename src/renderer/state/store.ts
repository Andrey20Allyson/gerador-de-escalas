import { configureStore } from "@reduxjs/toolkit";
import { tableEditorSlice } from "./slices/table-editor";
import { tableEditorLoaderSlice } from "./slices/table-editor-loader";

export const store = configureStore({
  reducer: {
    tableEditor: tableEditorSlice.reducer,
    tableEditorLoader: tableEditorLoaderSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
