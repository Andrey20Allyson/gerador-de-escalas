import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { useRerender } from "../../hooks";
import { ElementList } from "../../utils/react-iteration";
import { PropsWithTableEditor } from "../DutyTableGrid";
import { WorkerEditionCard } from "../WorkerEditionCard";
import { useDayEditionModal } from "../DayEditionModal";

export function WorkerList(props: PropsWithTableEditor) {
  const { table } = props;

  const [search, setSearch] = useState<string>();

  const workers = useMemo(() => {
    return Array.from(table.iterWorkers()).sort((a, b) => a.name().toLowerCase() < b.name().toLowerCase() ? -1 : 1)
  }, [table.data.workers]);
  const modal = useDayEditionModal();
  const rerender = useRerender();

  const filteredWorkers = search ? workers.filter(worker => worker.name().toUpperCase().includes(search.toUpperCase())) : workers;

  function handleOpenModal(dayIndex: number, dutyIndex: number) {
    modal.open({ table, dayIndex, dutyIndex, onUpdate: rerender });
  }

  function handleChangeSearch(ev: React.ChangeEvent<HTMLInputElement>) {
    const newSearch = ev.currentTarget.value;

    setSearch(newSearch.length > 0 ? newSearch : undefined);
  }

  return (
    <StyledWorkerList>
      <section className='search'>
        <input type="text" placeholder='pesquisar' onChange={handleChangeSearch} />
      </section>
      <section className='scroll-box'>
        <span className='scrolable'>
          <ElementList communProps={{ onOpenModal: handleOpenModal }} Component={WorkerEditionCard} iter={filteredWorkers} />
        </span>
      </section>
    </StyledWorkerList>
  );
}

export const StyledWorkerList = styled.section`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: .4rem;

  &>.scroll-box {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: stretch;
  
    &>.scrolable {
      position: absolute;
      height: inherit;
      width: inherit;
      overflow-y: scroll;
      display: flex;
      flex-direction: column;
      box-sizing: content-box;
      gap: .4rem;

      &::after {
        content: " ";
        height: .3rem;
      }
  
      &::-webkit-scrollbar {
        width: 10px;
      }
  
      &::-webkit-scrollbar-thumb {
        background-color: #f3f3f345;
        border-radius: 4px;
        width: 8px;
      }
  
      &:hover::-webkit-scrollbar-thumb {
        background-color: #ececec78;
      }
  
      &::-webkit-scrollbar-track {
        background-color: #d1d1d17d;
        border-radius: 4px;
        width: 8px;
      }
    }
  }
`;
