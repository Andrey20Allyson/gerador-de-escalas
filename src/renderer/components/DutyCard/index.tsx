import React from "react";
import { GrClose } from "react-icons/gr";
import { PiBookOpen } from "react-icons/pi";
import styled from "styled-components";
import { DutyEditor } from "../../../app/api/table-edition";
import { IterProps } from "../../utils/react-iteration";
import { dutyTitles } from "../DutyTableGrid/utils";

export interface DutyCardProps {
  titleType?: 'numeric' | 'extence';

  onOpenModal?: (day: number, duty: number) => void;
  onExcludeDuty?: (day: number, duty: number) => void;
}

export function DutyCard(props: IterProps<DutyEditor, DutyCardProps>) {
  const { onOpenModal, onExcludeDuty, titleType = 'numeric' } = props;

  const duty = props.entry;
  const day = duty.parent;

  function handleOpenModal() {
    onOpenModal?.(day.index(), duty.index());
  }

  function handleExcludeDuty() {
    onExcludeDuty?.(day.index(), duty.index());
  }

  let title: string;

  switch (titleType) {
    case 'extence':
      title = `Dia ${day.index() + 1} - Turno das ${dutyTitles.at(duty.index())}`;
      break;
    case 'numeric':
      title = `Dia ${day.index() + 1}.${duty.index() + 1}`
      break;
  }

  return (
    <StyledDutyCard>
      <div className='head'>
        {title}
      </div>
      <div className='buttons'>
        {onOpenModal && <button onClick={handleOpenModal}>
          <PiBookOpen />
        </button>}
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
  gap: .1rem;
  flex: 1;
  display: flex;
  justify-content: space-evenly;

  &>.head {
    justify-content: center;
    align-items: center;
    display: flex;
    font-size: .9rem;
    flex: 1.2;
  }

  &>.buttons {
    display: flex;
    flex: 1;
    gap: .3rem;
    justify-content: space-around;
    align-items: center;
    
    &>button {
      cursor: pointer;
      background-color: #99999961;
      outline: none;
      border: 1px solid #ffffff7d;
      display: flex;
      align-items: center;
      border-radius: .3rem;
      justify-content: center;
      transition: all 200ms;
      height: max-content;
      flex: 1;

      &:hover {
        background-color: #f0f0f0c5
      }

      &.exclude {
        background-color: #ff00004c;
        border-color: #f008;
        flex: .5;
        
        &:hover {
          background-color: #ff0000a4;
        }
      }
    }
  }
`; 
