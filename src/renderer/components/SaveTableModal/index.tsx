import { TableEditorController } from "state/controllers/table-editor";
import { SerializationMode } from "../../../app/api/ipc";
import { TableEditor } from "../../../app/api/table-edition";
import { AppError, editor } from "../../api";
import { createModalContext } from "../../contexts/modal";
import { saveFile } from "../../utils";
import React from "react";
import { AiOutlineCloseCircle } from "react-icons/ai";
import styled from "styled-components";

export interface SaveTableModalProps { }

export function SaveTableModal(props: SaveTableModalProps) {
  const tableController = new TableEditorController();

  const handler = useSaveTableModal();

  async function serialize(mode: SerializationMode) {
    const saveResponse = await editor.save(tableController.table);
    if (!saveResponse.ok) return saveResponse;

    return editor.serialize(mode);
  }

  async function handleSaveToDivugation() {
    const result = await serialize('divugation');
    if (!result.ok) return AppError.log(result.error);

    saveFile('Escala de Divultação.xlsx', result.data);
  }

  async function handleSaveToPayment() {
    const result = await serialize('payment');
    if (!result.ok) return AppError.log(result.error);

    saveFile('Escala da Extra.xlsx', result.data);
  }

  async function handleSaveToDayList() {
    const result = await serialize('day-list');
    if (!result.ok) return AppError.log(result.error);

    saveFile('Listagem de Dias.xlsx', result.data);
  }

  function handleClose() {
    handler.close();
  }

  return (
    <StyledSaveTableModal>
      <section className='head'>
        <AiOutlineCloseCircle color='#f00' size={25} onClick={handleClose} />
      </section>
      <section className='body'>
        <h1>Escolha um formato para salvar</h1>
        <button onClick={handleSaveToPayment}>Salvar para pagamento</button>
        <button onClick={handleSaveToDivugation}>Salvar para divulgação</button>
        <button onClick={handleSaveToDayList}>Salvar Listagem de dias</button>
      </section>
    </StyledSaveTableModal>
  );
}

export const StyledSaveTableModal = styled.span`
  border: 1px solid #0005;
  border-radius: .5rem;
  display: grid;
  grid-template-rows: 2rem 1fr;
  background-color: #dfdfdf;

  &>.head {
    background-color: #b9b9b9;
    border-top-left-radius: inherit;
    border-top-right-radius: inherit;
    display: flex;
    align-items: center;
    justify-content: end;
    padding: 0 .5rem;

    &>svg {
      cursor: pointer;
    }
  }

  &>.body {
    padding: .5rem;
    display: flex;
    gap: .5rem;
    flex-direction: column;
    align-items: stretch;

    &>h1 {
      font-size: 1rem;
    }

    &>button {
      border: 1px solid #07500c;
      outline: none;
      border-radius: .25rem;
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
        transform: scale(.99);
      }
    }
  }
`;

export const {
  ModalProvider: SaveTableModalProvider,
  useModal: useSaveTableModal,
} = createModalContext(SaveTableModal);