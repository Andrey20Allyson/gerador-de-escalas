import React from "react";
import { AiOutlineCloudUpload, AiOutlineDelete, AiOutlineSave } from "react-icons/ai";
import styled from "styled-components";
import { ElementList } from "../../utils/react-iteration";
import { StyledToolsSection } from "../Editor/EditTableStage.styles";
import { WorkerRegistryView } from "./components/WorkerRegistryView";
import { RegistryGrid } from "./components/RegistryGrid";
import { mockedWorkers } from "./mock";
import { RegistrySearch } from "./components/RegistrySearch";

export default function Configuration() {
  return (
    <StyledConfiguration>
      <StyledToolsSection>
        <button><AiOutlineSave />Salvar</button>
      </StyledToolsSection>
      <div className="body">
        <section className="register-section">
          <h1>Registrar agente</h1>
          <StyledConfigTextInput>
            Nome
            <input type="text" />
          </StyledConfigTextInput>
          <StyledConfigTextInput>
            CPF
            <input type="text" />
          </StyledConfigTextInput>
          <StyledConfigTextInput>
            Matrícula
            <input type="text" />
          </StyledConfigTextInput>
          <section className="register-footer">
            <div className="footer-collumn">
              <label>Gênero</label>
              <select name="" id="">
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>
            <StyledVerticalLine />
            <div className="footer-collumn">
              <label>Graduação</label>
              <select name="" id="">
                <option value="gcm">GCM</option>
                <option value="sub-insp">Sub Inspetor</option>
                <option value="insp">Inspetor</option>
              </select>
            </div>
            <StyledVerticalLine />
            <div className="footer-collumn">
              <label>Coodenador</label>
              <input type="checkbox" />
            </div>
          </section>
          <div className="register-actions">
            <button><AiOutlineCloudUpload />Registrar</button>
            <button><AiOutlineDelete /> Resetar</button>
          </div>
        </section>
        <StyledVerticalLine />
        <section className="search-section">
          <RegistrySearch />
          <RegistryGrid>
            <ElementList
              Component={WorkerRegistryView}
              iter={mockedWorkers} />
          </RegistryGrid>
        </section>
      </div>
    </StyledConfiguration>
  );
}

export const StyledVerticalLine = styled.span`
  width: 1px;
  background-color: #0002;
`;

export const StyledConfigTextInput = styled.label`
  display: flex;
  flex-direction: column;
  text-indent: .3rem;

  &>input {
    background-color: #fafafa;
    border: 1px solid #0001;
    border-radius: .4rem;
  }
`;

export const StyledConfiguration = styled.div`
  width: 100%;
  height: 100%;
  align-items: stretch;
  flex-direction: column;

  display: flex;

  &>.body {
    flex: 1;
    display: flex;
    padding: .75rem;
    box-sizing: border-box;
    gap: .75rem;
  
    &>.register-section {
      flex: .6;
      display: flex;
      flex-direction: column;
      max-width: 28rem;
      gap: .5rem;

      &>.register-footer {
        display: flex;
        justify-content: space-between;
        padding: 0 1rem;
        gap: .4rem;
        min-height: 7rem;

        &>.footer-collumn {
          display: flex;
          flex-direction: column;
          gap: .3rem;
          padding: .2rem;
          justify-content: start;

          &>select {
            height: min-content;
          }

          &>input {
            box-shadow: none;
            cursor: pointer;
          } 
        }
      }

      &>.register-actions {
        display: flex;
        gap: .4rem;

        &>button {
          border: 1px solid #0003;
          cursor: pointer;
          font-size: 1rem;
          padding: .3rem .7rem;
          transition: all 300ms;
          display: flex;
          gap: .3rem;
          align-items: center;

          &:hover {
            background-color: #fafafa;
            box-shadow: 0 .2rem .3rem #0003;
          }

          &:active {
            box-shadow: none;
          }
        }
      }
    }
  
    &>.search-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }
  }
`;