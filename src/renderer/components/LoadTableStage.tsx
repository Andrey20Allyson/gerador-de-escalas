// import { useStage } from "../contexts/stages";
// import { HeaderLabel } from "../pages/Generator/WorkerEditionStage.styles";
// import React, { useRef } from "react";
// import { TableSheetSelect, TableSheetSelectState } from "./TableSheetSelect";

// export interface LoadTableFormData {
//   selectedTable: TableSheetSelectState;
// }

// export interface LoadTableStageProps {
//   title: string;
//   onSubmit?: (data: LoadTableFormData) => boolean | Promise<boolean>;
// }

// export function LoadTableStage(props: LoadTableStageProps) {
//   const selectedTableStateRef = useRef<TableSheetSelectState>();
//   const { next } = useStage();

//   async function handleSubmit() {
//     const selectedTableState = selectedTableStateRef.current;

//     if (!selectedTableState)
//       return alert("Algum(s) dos campos obrigatórios não foram preenchidos");

//     const successPromise =
//       props.onSubmit?.({
//         selectedTable: selectedTableState,
//       }) ?? true;

//     const success = await successPromise;

//     if (success) next();
//   }

//   return (
//     <>
//       <HeaderLabel>{props.title}</HeaderLabel>
//       <div className="form-body">
//         <TableSheetSelect
//           fileInputTitle="Planilha"
//           selectTitle="Nome da Aba"
//           onChange={(state) => (selectedTableStateRef.current = state)}
//         />
//       </div>
//       <input type="button" value="Proximo" onClick={handleSubmit} />
//     </>
//   );
// }
