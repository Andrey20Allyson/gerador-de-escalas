import { useDayEditionModal } from "@gde/renderer/components/DayEditionModal";
import { EditorContext } from "@gde/renderer/components/EditorTypeSelect/context";
import { WorkerEditionCard } from "@gde/renderer/components/WorkerEditionCard";
import { useRerender } from "@gde/renderer/hooks";
import { ElementList } from "@gde/renderer/utils/react-iteration";
import React, { useMemo, useState } from "react";
import { BiSearch } from "react-icons/bi";
import styled from "styled-components";

export function WorkerList() {
  const table = EditorContext.useEditorOrThrow();
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
        <BiSearch/>
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
  padding: 1rem 2rem;
  box-sizing: border-box;
  gap: .8rem;
  
  &>.search {
    display: flex;
    gap: .4rem;
    padding: .4rem;
    align-items: center;
    border-radius: .2rem;

    &:hover {
      background-color: #fff4;
    }

    &:focus-within {
      background-color: #fff5;
    }

    &>input {
      width: 100%;
      border: none;
      
      &:focus {
        box-shadow: none;
      }
    }

    &>svg {
      font-size: 1rem;
    }
  }

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
      align-items: center;
      box-sizing: border-box;
      overflow-x: hidden;
      padding: 0 1.5rem;
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
        background-color: #d1d1d1ab;
        border-radius: 4px;
        width: 8px;
      }
    }
  }
`;
