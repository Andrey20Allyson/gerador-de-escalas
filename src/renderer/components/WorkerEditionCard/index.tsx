import React from "react";
import styled from "styled-components";
import { WorkerEditor } from "../../../app/api/table-edition";
import { useRerender } from "../../hooks";
import { ColoredText } from "../../pages/Generator/WorkerEditionStage.styles";
import { ElementList, IterProps } from "../../utils/react-iteration";
import { genderComponentMap, graduationTextColorMap } from "../DayEditionModal/utils";
import { DutyCard } from "../DutyCard";

export interface WorkerEditionCardProps {
  onOpenModal?: (day: number, duty: number) => void;
}

export function WorkerEditionCard(props: IterProps<WorkerEditor, WorkerEditionCardProps>) {
  const { onOpenModal } = props;

  const worker = props.entry;
  const rerender = useRerender();

  const duties = worker.iterDuties();

  function handleExcludeDuty(day: number, duty: number) {
    const dutyEditor = worker.table.getDay(day).getDuty(duty);

    if (dutyEditor.deleteWorker(worker.id()) && worker.deleteDuty(dutyEditor.address())) rerender();
  }

  const graduation = worker.graduation();
  const upperCaseGraduation = graduation.toUpperCase();

  const Gender = genderComponentMap[worker.gender()];

  return (
    <StyledWorkerEditionCard>
      <section className='presentation'>
        <p className='name'>{worker.name()}</p>
        <div className='info'>
          <Gender />
          [<ColoredText color={graduationTextColorMap[graduation]}>{upperCaseGraduation}</ColoredText>]
          <p className='id'>Mat: {worker.id()}</p>
        </div>
      </section>
      <section className='duty-list'>
        <ElementList Component={DutyCard} communProps={{ onExcludeDuty: handleExcludeDuty, onOpenModal }} iter={duties} />
      </section>
    </StyledWorkerEditionCard>
  );
}

export const StyledWorkerEditionCard = styled.span`
  font-size: .9rem;
  border: 1px solid #0004;
  background-color: #fff3;
  border-radius: .5rem;
  margin: 0 .4rem;
  padding: .5rem;
  display: flex;
  box-shadow: -.2rem .2rem .3rem #0003;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  &>.presentation {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 40%;

    &>.name {
      margin: 0;
      flex: 1;
      text-align: left;
      white-space: nowrap;
      overflow: hidden;
      font-weight: bold;
      text-overflow: ellipsis;
    }

    &>.info {
      flex: 1;
      display: flex;
      align-items: center;
      gap: .5rem;

      &>.id {
        margin: 0;
      }
    }
  }

  &>.duty-list {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: .3rem;
    width: 60%;
  }
`;