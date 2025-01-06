import { DutyEditorController } from "../../state/controllers/editor/duty";
import { BackgroundColor } from "../../styles";
import { IterProps } from "../../utils/react-iteration";
import React from "react";
import { GrClose } from "react-icons/gr";
import { PiBookOpen } from "react-icons/pi";
import styled from "styled-components";

export interface DutyCardProps {
  titleType?: "numeric" | "extence";

  onOpenModal?: (id: number) => void;
  onExcludeDuty?: (id: number) => void;
}

const dutyMessageMap = new Map([
  [0, "N2"],
  [1, "D1"],
  [2, "D2"],
  [3, "N1"],
]);

export function DutyCard(props: IterProps<number, DutyCardProps>) {
  const { onOpenModal, onExcludeDuty, titleType = "numeric" } = props;

  const dutyController = new DutyEditorController(props.entry);
  const duty = dutyController.duty;
  const { date } = duty;

  function handleOpenModal() {
    onOpenModal?.(duty.id);
  }

  function handleExcludeDuty() {
    onExcludeDuty?.(duty.id);
  }

  let title: string;

  switch (titleType) {
    case "extence":
      title = `Dia ${date.day + 1} - Turno das ${dutyController.format.hours()}`;
      break;
    case "numeric":
      title = `Dia ${date.day + 1} - ${dutyMessageMap.get(duty.index) ?? "?"}`;
      break;
  }

  return (
    <StyledDutyCard>
      <div className="head">{title}</div>
      <div className="buttons">
        {onOpenModal && (
          <button onClick={handleOpenModal}>
            <PiBookOpen />
          </button>
        )}
        <button className="exclude" onClick={handleExcludeDuty}>
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
  border-radius: 0.2rem;
  font-weight: bold;
  padding: 0.2rem;
  user-select: none;
  gap: 0.1rem;
  flex: 1;
  display: flex;
  justify-content: space-evenly;

  & > .head {
    justify-content: center;
    align-items: center;
    display: flex;
    font-size: 0.9rem;
    flex: 1.2;
  }

  & > .buttons {
    display: flex;
    flex: 1;
    gap: 0.3rem;
    justify-content: space-around;
    align-items: center;

    & > button {
      cursor: pointer;
      ${BackgroundColor.bg1}
      outline: none;
      border: 1px solid #0003;
      display: flex;
      align-items: center;
      border-radius: 0.3rem;
      justify-content: center;
      transition: all 200ms;
      height: max-content;
      flex: 1;

      &:hover {
        background-color: #979797c5;
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
