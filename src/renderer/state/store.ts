import { configureStore } from '@reduxjs/toolkit';
import { tableEditorSlice } from './slices/table-editor';

export const store = configureStore({
  reducer: {
    tableEditor: tableEditorSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch