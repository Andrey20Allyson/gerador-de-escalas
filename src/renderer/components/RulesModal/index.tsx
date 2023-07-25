import React, { MutableRefObject, useRef, useState } from 'react';
import styled from 'styled-components';
import { TableEditor } from '../../../app/api/table-edition';
import { createModalContext } from '../../contexts/modal';

export interface RulesModalProps {
  table: TableEditor;
}

export function RulesModal(props: RulesModalProps) {
  const { table } = props;
  const modalHandler = useRulesModal();

  const setValueListeners: Set<SetToggleButtonValue> = new Set();
  const rules = table.rules();

  function handleConfirm() {
    modalHandler.close();
  }

  function handleReset() {
    rules.ordinaryRule = true;
    rules.timeOffRule = true;
    rules.femaleRule = true;
    rules.inspRule = true;

    for (const listener of setValueListeners) {
      listener(true);
    }
  }

  function assignSetValueListener(listener: SetToggleButtonValue) {
    setValueListeners.add(listener);
  }

  return (
    <StyledRulesModal>
      <section className='title-container'>
        <h1>Configurar Regras</h1>
      </section>
      <section className='options'>
        <ToggleButton
          actived={rules.femaleRule}
          setValueRef={assignSetValueListener}
          onToggle={value => rules.femaleRule = value}
          title='Regra de Genero' />
        <ToggleButton
          actived={rules.inspRule}
          setValueRef={assignSetValueListener}
          onToggle={value => rules.inspRule = value}
          title='Regra dos Inspetores' />
        <ToggleButton
          actived={rules.ordinaryRule}
          setValueRef={assignSetValueListener}
          onToggle={value => rules.ordinaryRule = value}
          title='Regra da Ordinária' />
        <ToggleButton
          actived={rules.timeOffRule}
          setValueRef={assignSetValueListener}
          onToggle={value => rules.timeOffRule = value}
          title='Regra dos Intervalos' />
      </section>
      <section className='buttons-container'>
        <input onClick={handleReset} type='button' value='Desconfigurar' />
        <input onClick={handleConfirm} type='button' value='Confirmar' />
      </section>
    </StyledRulesModal>
  );
}

export const StyledRulesModal = styled.span`
  background-color: #d1d1d1;
  border: 1px solid #0005;
  border-radius: .5rem;
  padding: .5rem;
  display: grid;
  grid-template-rows: 3rem 1fr 3rem;

  &>.options {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: .5rem;
  }

  &>.buttons-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: .5rem;
  }
`;

type SetToggleButtonValue = (value: boolean) => void;

export interface ToggleButtonProps {
  title: string;
  actived?: boolean;
  onToggle?: (value: boolean) => void;
  setValueRef?: MutableRefObject<SetToggleButtonValue | undefined> | ((ref: SetToggleButtonValue) => void);
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
      <span className='title-container'>
        {title}
      </span>
      <span className={`view${value ? ' actived' : ''}`}>
        <span className={`ball${value ? ' actived' : ''}`} />
      </span>
    </StyledToggleButton>
  );
}

export const StyledToggleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .5rem;
  background-color: #0000;
  outline: none;
  border: none;
  cursor: pointer;
  transition: all 200ms;
  border-radius: .5rem;
  padding: .25rem .5rem;

  &:hover {
    background-color: #fff4;
  }

  &>.title-container {
    font-weight: bold;
    font-size: 1rem;
  }

  &>.view {
    display: flex;
    align-items: center;
    background-color: #cccccc;
    border: 1px solid #0005;
    height: 1rem;
    width: 2.5rem;
    position: relative;
    border-radius: .5rem;
    transition: all 500ms;
    box-shadow: -.1rem .1rem .2rem #0005 inset;

    &.actived {
      background-color: #2d84be;
    }
    
    &>.ball {
      transition: all 500ms;
      position: absolute;
      height: 1rem;
      width: 1rem;
      background-color: #e7e7e7;
      border-radius: .5rem;
      border: 1px solid #0002;
      left: -1px;

      &.actived {
        left: calc(100% + 1px);
        transform: translate(-100%);
      }
    }
  }
`;

export const {
  ModalProvider: RulesModalProvider,
  useModal: useRulesModal,
} = createModalContext(RulesModal);