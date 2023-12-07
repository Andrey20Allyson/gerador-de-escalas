import React from 'react';
import { BsPeopleFill } from 'react-icons/bs';
import styled from 'styled-components';
import { OnDutySelect, dutyTitles } from '../../../components/DutyTableGrid/utils';
import { TableEditorController } from '../../../state/controllers/editor/table';
import { WorkerEditorController } from '../../../state/controllers/editor/worker';
import { getWeekDayLabel } from '../../../utils';
import { ElementList, IterProps } from '../../../utils/react-iteration';

export interface DutySelectionGridProps {
  workerId: number;
  onDutySelected?: OnDutySelect;
}

export function DutySelectionGrid(props: DutySelectionGridProps) {
  const { workerId, onDutySelected } = props;

  const tableController = new TableEditorController();

  return (
    <StyledDutySelectionGrid>
      <ElementList Component={DayCard} communProps={{ onDutySelected, workerId }} iter={tableController.iterDays()} />
    </StyledDutySelectionGrid>
  );
}

const StyledDutySelectionGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  height: min-content;
  gap: .4rem;
  padding: .5rem;
`;

export interface DayCardProps {
  onDutySelected?: OnDutySelect;
  workerId: number;
}

export function DayCard(props: IterProps<number, DayCardProps>) {
  const { onDutySelected, workerId } = props;
  const day = props.entry;

  const tableController = new TableEditorController();

  const weekDayLabel = getWeekDayLabel(tableController.dayOfWeekFrom(day));

  return (
    <StyledDayCard>
      Dia {day + 1} - {weekDayLabel}
      <span className='duty-row'>
        <ElementList Component={DutySelectButton} communProps={{ onDutySelected, workerId, day }} iter={tableController.iterDutyIndexes()} />
      </span>
    </StyledDayCard>
  );
}

export const StyledDayCard = styled.span`
  border: 1px solid #0005;
  border-radius: .5rem;
  padding: .25rem;
  box-shadow: -.1rem .1rem .2rem #0004;
  background-color: #ffffff14;
  font-size: .8rem;
  display: flex;
  font-weight: bold;
  flex-direction: column;
  align-items: stretch;
  text-align: center;

  &>.duty-row {
    display: flex;
    gap: .3rem;
  }
`;

export interface DutySelectButtonProps {
  onDutySelected?: OnDutySelect;
  day: number;
  workerId: number;
}

export function DutySelectButton(props: IterProps<number, DutySelectButtonProps>) {
  const { onDutySelected, workerId, day, entry: index } = props;
  
  const tableController = new TableEditorController();
  
  const dutyController = tableController.findDuty();
  if (!dutyController) throw new Error(`Can't find duty at day ${day} in index ${index}!`);
  
  const { duty } = dutyController;
  const dutySize = dutyController.size();

  const workerController = new WorkerEditorController(workerId);
  
  const text = dutyTitles.at(duty.index);
  const selected = workerController.duties().some(workerDuty => workerDuty.id === duty.id);

  const canSelect = true; // dutyController.canAddWorker(worker);

  function handleSelectDuty() {
    if (selected || canSelect) {
      onDutySelected?.(duty.id);
    }
  }

  return (
    <StyledDutySelectButton className={`${canSelect ? ' selectable' : ''}${selected ? ' selected' : ''}`} onClick={handleSelectDuty}>
      {text}
      <span className={`worker-quantity-display${dutySize < 2 ? ' low-quantity' : ''}`}>
        {dutySize}
        <BsPeopleFill />
      </span>
    </StyledDutySelectButton>
  );
}

const StyledDutySelectButton = styled.button`
  border-radius: .3rem;
  font-size: .6rem;
  padding: .15rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: .2rem;
  flex: 1;
  border: 1px solid #0004;
  text-align: center;
  user-select: none;
  transition: all 300ms;
  background-color: #0000;
  font-weight: bold;

  &>.worker-quantity-display {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: .2rem;

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
      background-color: #4fca6394
    }
  }
`;