// import { useEffect } from "react";
// import { api, AppError } from "../../api";
// import { LoadTableFormData } from "../../components/LoadTableStage";
// import { useStage } from "../../contexts/stages";
// import { useLoading, useTableData } from "../../hooks";
// import { TableEditorController } from "../../state/controllers/editor/table";
// import { sleep } from "../../utils";
// import { TableData } from "../../../apploader/api/table-reactive-edition/table";

// export type OnTableReady = (table: TableData) => void;

// export function useLoadedTable(callback: OnTableReady) {
//   const tableResponse = useTableData();

//   useEffect(() => {
//     if (tableResponse.status === "success") {
//       callback(tableResponse.data);
//     }
//   }, [tableResponse.status]);
// }

// export function useLoadEditorStage() {
//   const { next } = useStage();
//   const { listen, loading } = useLoading();
//   const tableLoader = TableEditorController.useEditorLoader();

//   useLoadedTable((table) => {
//     tableLoader.load(table);

//     next();
//   });

//   async function load(path: string) {
//     await sleep();

//     const result = await api.editor.load();

//     if (!result.ok) {
//       AppError.log(result.error);
//       return false;
//     }

//     const tableResponse = await api.editor.createEditor();

//     if (tableResponse.ok === false) {
//       AppError.log(tableResponse.error);
//       return false;
//     }

//     tableLoader.load(tableResponse.data);

//     return true;
//   }

//   async function loadOrdinaryWithoutMetadata() {

//   }

//   async function handleSubmit(data: LoadTableFormData): Promise<boolean> {
//     return listen(loadPreGenerateEditor(data));
//   }

//   return {
//     handleSubmit,
//     loading,
//   };
// }
