import React from "react";
import { GrClose } from "react-icons/gr";
import { PiBookOpen } from "react-icons/pi";
import styled from "styled-components";
import { DutyEditor } from "../../../app/api/table-edition";
import { IterProps } from "../../utils/react-iteration";

export interface DutyCardProps {
  onOpenModal?: (day: number, duty: number) => void;
  onExcludeDuty?: (day: number, duty: number) => void;
}

export function DutyCard(props: IterProps<DutyEditor, DutyCardProps>) {
  const { onOpenModal, onExcludeDuty } = props;

  const duty = props.entry;
  const day = duty.parent;

  function handleOpenModal() {
    onOpenModal?.(day.index(), duty.index());
  }

  function handleExcludeDuty() {
    onExcludeDuty?.(day.index(), duty.index());
  }

  return (
    <StyledDutyCard>
      <div className='head'>
        Dia {duty.parent.index() + 1}.{duty.index() + 1}
      </div>
      <div className='buttons'>
        <button onClick={handleOpenModal}>
          <PiBookOpen />
        </button>
        <button className='exclude' onClick={handleExcludeDuty}>
          <GrClose />
        </button>
      </div>
    </StyledDutyCard>
  );
}

export const StyledDutyCard = styled.span`
  box-shadow: -.1rem .1rem .2rem #0002 inset;
  background-color: #00000008;
  border: 1px solid #0002;
  flex-direction: column;
  border-radius: .2rem;
  font-weight: bold;
  padding: .2rem;
  user-select: none;
  gap: .3rem;
  flex: 1;

  &>.head {
    text-align: center;
    font-size: .8rem;
    flex: 1.2;
  }

  &>.buttons {
    display: flex;
    flex: 1.2;
    gap: .3rem;
    justify-content: space-around;
    
    &>button {
      cursor: pointer;
      background-color: #dddddd8a;
      outline: none;
      border: 1px solid #0004;
      display: flex;
      align-items: center;
      border-radius: .3rem;
      justify-content: center;
      transition: all 200ms;
      flex: 1;

      &:hover {
        background-color: #f0f0f0c5
      }

      &.exclude {
        background-color: #ff00004c;
        flex: .5;
        
        &:hover {
          background-color: #ff0000a4;
        }
      }
    }
  }
`; 
