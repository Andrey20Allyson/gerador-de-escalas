import React from "react";
import { BsPeopleFill } from "react-icons/bs";
import styled from "styled-components";
import { OnDutySelect } from "../../../components/DutyTableGrid/utils";
import { DutySearcher } from "../../../state/controllers/editor/searchers/duty";
import { TableEditorController } from "../../../state/controllers/editor/table";
import { WorkerEditorController } from "../../../state/controllers/editor/worker";
import { getWeekDayLabel } from "../../../utils";
import { ElementList, IterProps } from "../../../utils/react-iteration";
import { EditorRulesService as EditorRuleService } from "../../../state/controllers/editor/rules";
import { DateData } from "../../../../apploader/api/table-reactive-edition";
import { InfoCard } from "../../InfoCard";
import { useInfoCard } from "src/renderer/hooks/useInfoCard";

export interface DutySelectionGridProps {
  workerId: number;
  onDutySelected?: OnDutySelect;
}

export function DutySelectionGrid(props: DutySelectionGridProps) {
  const { workerId, onDutySelected } = props;

  const tableController = new TableEditorController();

  return (
    <StyledDutySelectionGrid>
      <ElementList
        Component={DayCard}
        communProps={{ onDutySelected, workerId }}
        iter={tableController.iterDays()}
      />
    </StyledDutySelectionGrid>
  );
}

const StyledDutySelectionGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  height: min-content;
  gap: 0.4rem;
  padding: 0.5rem;
`;

export interface DayCardProps {
  onDutySelected?: OnDutySelect;
  workerId: number;
}

export function DayCard(props: IterProps<DateData, DayCardProps>) {
  const { onDutySelected, workerId } = props;
  const date = props.entry;

  const tableController = new TableEditorController();

  const weekDayLabel = getWeekDayLabel(tableController.dayOfWeekFrom(date.day));

  return (
    <StyledDayCard>
      Dia {date.day + 1} - {weekDayLabel}
      <span className="duty-row">
        <ElementList
          Component={DutySelectButton}
          communProps={{ onDutySelected, workerId, date: date }}
          iter={tableController.iterDutyIndexes()}
        />
      </span>
    </StyledDayCard>
  );
}

export const StyledDayCard = styled.span`
  border: 1px solid #0005;
  border-radius: 0.5rem;
  padding: 0.25rem;
  box-shadow: -0.1rem 0.1rem 0.2rem #0004;
  background-color: #ffffff14;
  font-size: 0.8rem;
  display: flex;
  font-weight: bold;
  flex-direction: column;
  align-items: stretch;
  text-align: center;

  & > .duty-row {
    display: flex;
    gap: 0.3rem;
  }
`;

export interface DutySelectButtonProps {
  onDutySelected?: OnDutySelect;
  date: DateData;
  workerId: number;
}

export function DutySelectButton(
  props: IterProps<number, DutySelectButtonProps>,
) {
  const { onDutySelected, workerId, date, entry: index } = props;
  const infoCard = useInfoCard();

  const tableController = new TableEditorController();

  const dutyController = tableController.findDuty(
    DutySearcher.dayEquals(date).indexEquals(index),
  );
  if (!dutyController)
    throw new Error(`Can't find duty at day ${date} in index ${index}!`);

  const { duty } = dutyController;
  const dutySize = dutyController.size();

  const workerController = new WorkerEditorController(workerId);

  const title = dutyController.format.hours();
  const selected = workerController
    .duties()
    .some((workerDuty) => workerDuty.id === duty.id);

  const ruleService = new EditorRuleService();
  const { invalidations, isValid } = ruleService.checkAssignment(
    workerId,
    duty.id,
  );

  const isAtOrdinary = workerController.hasOrdinaryAt(duty);

  function handleSelectDuty() {
    if (selected || isValid) {
      onDutySelected?.(duty.id);
    }
  }

  infoCard.whenVisible(() => {
    return <InfoCard description="a" />;
  });

  infoCard.onlyIf(() => !isValid && !selected);

  return (
    <StyledDutySelectButton
      className={`${isValid ? " selectable" : ""}${selected ? " selected" : ""}${isAtOrdinary ? " ordinary" : ""}`}
      onClick={handleSelectDuty}
      onMouseEnter={infoCard.show}
      onMouseLeave={infoCard.hide}
    >
      {title}
      <span
        className={`worker-quantity-display${dutySize < 2 ? " low-quantity" : ""}`}
      >
        {dutySize}
        <BsPeopleFill />
      </span>
      {infoCard.intoNode()}
    </StyledDutySelectButton>
  );
}

const StyledDutySelectButton = styled.button`
  position: relative;
  border-radius: 0.3rem;
  font-size: 0.6rem;
  padding: 0.15rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.2rem;
  flex: 1;
  border: 1px solid #0004;
  text-align: center;
  user-select: none;
  transition: all 300ms;
  background-color: #0000;
  font-weight: bold;

  & > .worker-quantity-display {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.2rem;

    &.low-quantity {
      color: #e21111;
    }
  }

  &.selectable {
    background-color: #4fca632d;
    cursor: pointer;

    &:hover {
      background-color: #4fca6367;
    }
  }

  &.selected {
    background-color: #4fca63;
    cursor: pointer;

    &:hover {
      background-color: #4fca6394;
    }
  }

  &.ordinary {
    border-color: #1189a7c5;
    background-color: #43c8e9;
  }
`;
