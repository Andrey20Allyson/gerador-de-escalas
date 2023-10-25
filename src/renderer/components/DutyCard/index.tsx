import React from "react";
import { GrClose } from "react-icons/gr";
import { PiBookOpen } from "react-icons/pi";
import styled from "styled-components";
import { DutyEditor } from "../../../app/api/table-edition";
import { IterProps } from "../../utils/react-iteration";
import { dutyTitles } from "../DutyTableGrid/utils";
import { BackgroundColor } from "../../styles";

export interface DutyCardProps {
  titleType?: 'numeric' | 'extence';

  onOpenModal?: (day: number, duty: number) => void;
  onExcludeDuty?: (day: number, duty: number) => void;
}

const dutyMessageMap = new Map([
  [0, 'D'],
  [1, 'N'],
]);

export function DutyCard(props: IterProps<DutyEditor, DutyCardProps>) {
  const { onOpenModal, onExcludeDuty, titleType = 'numeric' } = props;

  const duty = props.entry;
  const { day } = duty;

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
      title = `Dia ${day.index() + 1} - ${dutyMessageMap.get(duty.index()) ?? '?'}`
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
  /* box-shadow: -.1rem .1rem .2rem #0002 inset; */
  ${BackgroundColor.bg2}
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
      ${BackgroundColor.bg1}
      outline: none;
      border: 1px solid #0003;
      display: flex;
      align-items: center;
      border-radius: .3rem;
      justify-content: center;
      transition: all 200ms;
      height: max-content;
      flex: 1;

      &:hover {
        background-color: #979797c5
      }

      &.exclude {
        background-color: #ff00004c;
        border-color: #f008;
        font-weight: bold;
        
        &:hover {
          background-color: #ff0000a4;
        }
      }
    }
  }
`; 
