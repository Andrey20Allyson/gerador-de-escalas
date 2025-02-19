import { TableEditorController } from "../../state/controllers/editor/table";
import { AppError, api } from "../../api";
import { createModalContext } from "../../contexts/modal";
import React from "react";
import { AiOutlineCloseCircle } from "react-icons/ai";
import styled from "styled-components";
import { ScheduleFileType } from "src/lib/serialization";

export interface SaveTableModalProps {}

export function SaveTableModal(props: SaveTableModalProps) {
  const tableController = new TableEditorController();

  const handler = useSaveTableModal();

  async function saveAs(fileType: ScheduleFileType) {
    const state = tableController.table;

    const saveAsResult = await api.editor.saveAs(state, fileType);
    if (saveAsResult.ok === false) {
      return AppError.log(saveAsResult.error);
    }

    const newSaveConfig = saveAsResult.data;

    tableController.setFileSaveConfig(newSaveConfig);
  }

  function saveAsFor(fileType: ScheduleFileType) {
    return () => saveAs(fileType);
  }

  function handleClose() {
    handler.close();
  }

  return (
    <StyledSaveTableModal>
      <section className="head">
        <AiOutlineCloseCircle color="#f00" size={25} onClick={handleClose} />
      </section>
      <section className="body">
        <h1>Escolha um formato para salvar</h1>
        <button onClick={saveAsFor("payment")}>Salvar para pagamento</button>
        <button onClick={saveAsFor("divulgation")}>
          Salvar para divulgação
        </button>
        <button onClick={saveAsFor("json")}>Salvar Listagem de dias</button>
      </section>
    </StyledSaveTableModal>
  );
}

export const StyledSaveTableModal = styled.span`
  border: 1px solid #0005;
  border-radius: 0.5rem;
  display: grid;
  grid-template-rows: 2rem 1fr;
  background-color: #dfdfdf;

  & > .head {
    background-color: #b9b9b9;
    border-top-left-radius: inherit;
    border-top-right-radius: inherit;
    display: flex;
    align-items: center;
    justify-content: end;
    padding: 0 0.5rem;

    & > svg {
      cursor: pointer;
    }
  }

  & > .body {
    padding: 0.5rem;
    display: flex;
    gap: 0.5rem;
    flex-direction: column;
    align-items: stretch;

    & > h1 {
      font-size: 1rem;
    }

    & > button {
      border: 1px solid #07500c;
      outline: none;
      border-radius: 0.25rem;
      background-image: linear-gradient(90deg, #067411, #099209);
      transition: all 200ms;
      color: #dfdfdfd5;
      font-weight: bold;
      cursor: pointer;

      &:hover {
        border-color: #2cc92c;
        color: #dfdfdf;
      }

      &:active {
        transform: scale(0.99);
      }
    }
  }
`;

export const {
  ModalProvider: SaveTableModalProvider,
  useModal: useSaveTableModal,
} = createModalContext(SaveTableModal);
