import React from "react";
import { AiOutlineSave } from "react-icons/ai";
import { BsArrowReturnLeft, BsGear } from 'react-icons/bs';
import { GoTriangleDown } from 'react-icons/go';
import styled from "styled-components";
import { editor } from "../../api";
import { EditorContext } from "../../components/EditorTypeSelect/context";
import { useRulesModal } from "../../components/RulesModal";
import { useSaveTableModal } from "../../components/SaveTableModal";
import { useStage } from "../../contexts/stages";
import { EditorTypeSelect } from "../../components/EditorTypeSelect";

export function EditTableStage() {
  const { prev } = useStage();
  const saveModal = useSaveTableModal();
  const rulesModal = useRulesModal();
  const table = EditorContext.useEditor();
  const changeEditor = EditorContext.useNavigate();

  function handleSaveAs() {
    if (!table) return;

    saveModal.open({ table });
  }

  function handleOpenRulesModal() {
    if (!table) return;

    rulesModal.open({ table });
  }

  async function handlePrev() {
    await editor.clear();

    prev();
  }

  return (
    <StageBody>
      <section className='tools-section'>
        <button onClick={handlePrev}><BsArrowReturnLeft />Voltar</button>
        <button onClick={handleSaveAs}><AiOutlineSave />Salvar</button>
        <button onClick={handleOpenRulesModal}><BsGear />Regras</button>
        <StyledSelector>
          Editores
          <GoTriangleDown />
          <section className="selection-section">
            <button onClick={() => changeEditor('DutyTableGrid', {})}>Calendário</button>
            <button onClick={() => changeEditor('WorkerList', {})}>Lista</button>
          </section>
        </StyledSelector>
      </section>
      <section className='editor-section'>
        <EditorTypeSelect />
      </section>
    </StageBody>
  );
}

const StyledSelector = styled.section`
  align-items: center;
  display: flex;
  position: relative;
  padding: .2rem;
  background-color: #f3f3f3;
  border: 1px solid #0003;
  user-select: none;
  
  &>.selection-section {
    position: absolute;
    left: -1px;
    bottom: 0;
    transform: translate(0, 100%);
    background-color: #f3f3f3;
    border: 1px solid #0003;
    visibility: hidden;
    width: max-content;
    max-width: 170%;
    flex-wrap: wrap;
    padding: .2rem;
    box-sizing: border-box;
    display: flex;
    gap: .2rem;
    justify-content: stretch;
    
    &>button {
      cursor: pointer;
      border: none;
      transition: background-color 200ms;
      flex: 1;

      &:hover {
        background-color: #0002;
      }
    }
  }

  &:hover {
    background-color: #eaeaea;

    &>.selection-section {
      visibility: visible;
    }
  }
`;

const StageBody = styled.section`
  flex-direction: column;
  display: flex;
  flex: 1;
  width: 100%;
  z-index: 2;
  
  &>.tools-section {
    background-color: #f3f3f3;
    height: 3rem;
    display: flex;
    align-items: stretch;
    padding: .5rem 1.5rem;
    box-sizing: border-box;
    gap: .4rem;
    box-shadow: 0 .3rem .4rem #0003;

    &>button {
      background-color: #efefef;
      background-image: none;
      color: #000;
      border-radius: 0;
      box-shadow: none;
      font-weight: normal;
      border: 1px solid #0002;
      cursor: pointer;
      font-size: 1rem;
      transition: all 200ms;
      display: flex;
      align-items: center;
      gap: .2rem;

      &:hover {
        box-shadow: 0 .3rem .3rem #0003;
      }
      
      &:active {
        box-shadow: none;
      }
    }
  }

  &>.editor-section {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;