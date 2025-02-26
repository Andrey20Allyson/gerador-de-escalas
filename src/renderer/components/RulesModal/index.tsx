import { createModalContext } from "../../contexts/modal";
import React, { MutableRefObject, useState } from "react";
import { TableEditorController } from "../../state/controllers/editor/table";
import styled from "styled-components";
import { WorkerInsertionRulesState } from "src/apploader/api/table-reactive-edition";

export function RulesModal() {
  const tableController = new TableEditorController();
  const modalHandler = useRulesModal();

  const setValueListeners: Set<SetToggleButtonValue> = new Set();
  const rules: WorkerInsertionRulesState = tableController.table.rules;

  function handleConfirm() {
    modalHandler.close();
  }

  function handleReset() {
    tableController.setRule("ordinaryRule", true);
    tableController.setRule("timeOffRule", true);
    tableController.setRule("femaleRule", true);
    tableController.setRule("inspRule", true);

    for (const listener of setValueListeners) {
      listener(true);
    }
  }

  function assignSetValueListener(listener: SetToggleButtonValue) {
    setValueListeners.add(listener);
  }

  return (
    <StyledRulesModal>
      <section className="title-container">
        <h1>Configurar Regras</h1>
      </section>
      <section className="options">
        <ToggleButton
          actived={rules.femaleRule}
          setValueRef={assignSetValueListener}
          onToggle={(value) => tableController.setRule("femaleRule", value)}
          title="Regra de Genero"
        />
        <ToggleButton
          actived={rules.inspRule}
          setValueRef={assignSetValueListener}
          onToggle={(value) => tableController.setRule("inspRule", value)}
          title="Regra dos Inspetores"
        />
        <ToggleButton
          actived={rules.ordinaryRule}
          setValueRef={assignSetValueListener}
          onToggle={(value) => tableController.setRule("ordinaryRule", value)}
          title="Regra da Ordinária"
        />
        <ToggleButton
          actived={rules.timeOffRule}
          setValueRef={assignSetValueListener}
          onToggle={(value) => tableController.setRule("timeOffRule", value)}
          title="Regra dos Intervalos"
        />
      </section>
      <section className="buttons-container">
        <input onClick={handleReset} type="button" value="Desconfigurar" />
        <input onClick={handleConfirm} type="button" value="Confirmar" />
      </section>
    </StyledRulesModal>
  );
}

export const StyledRulesModal = styled.span`
  background-color: #d1d1d1;
  border: 1px solid #0005;
  border-radius: 0.5rem;
  padding: 0.5rem;
  display: grid;
  grid-template-rows: 3rem 1fr 3rem;

  & > .options {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  & > .buttons-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
`;

type SetToggleButtonValue = (value: boolean) => void;

export interface ToggleButtonProps {
  title: string;
  actived?: boolean;
  onToggle?: (value: boolean) => void;
  setValueRef?:
    | MutableRefObject<SetToggleButtonValue | undefined>
    | ((ref: SetToggleButtonValue) => void);
}

export function ToggleButton(props: ToggleButtonProps) {
  const { actived = false, title, onToggle, setValueRef } = props;

  const [value, setValue] = useState(actived);

  if (setValueRef) {
    if (setValueRef instanceof Function) {
      setValueRef(setValue);
    } else {
      setValueRef.current = setValue;
    }
  }

  function handleClick() {
    const newValue = !value;

    onToggle?.(newValue);

    setValue(newValue);
  }

  return (
    <StyledToggleButton onClick={handleClick}>
      <span className="title-container">{title}</span>
      <span className={`view${value ? " actived" : ""}`}>
        <span className={`ball${value ? " actived" : ""}`} />
      </span>
    </StyledToggleButton>
  );
}

export const StyledToggleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  background-color: #0000;
  outline: none;
  border: none;
  cursor: pointer;
  transition: all 200ms;
  border-radius: 0.5rem;
  padding: 0.25rem 0.5rem;

  &:hover {
    background-color: #fff4;
  }

  & > .title-container {
    font-weight: bold;
    font-size: 1rem;
  }

  & > .view {
    display: flex;
    align-items: center;
    background-color: #cccccc;
    border: 1px solid #0005;
    height: 1rem;
    width: 2.5rem;
    position: relative;
    border-radius: 0.5rem;
    transition: all 500ms;
    box-shadow: -0.1rem 0.1rem 0.2rem #0005 inset;

    &.actived {
      background-color: #2d84be;
    }

    & > .ball {
      transition: all 500ms;
      position: absolute;
      height: 1rem;
      width: 1rem;
      background-color: #e7e7e7;
      border-radius: 0.5rem;
      border: 1px solid #0002;
      left: -1px;

      &.actived {
        left: calc(100% + 1px);
        transform: translate(-100%);
      }
    }
  }
`;

export const { ModalProvider: RulesModalProvider, useModal: useRulesModal } =
  createModalContext(RulesModal);
