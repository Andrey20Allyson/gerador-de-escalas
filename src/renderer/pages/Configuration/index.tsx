import React from "react";
import { AiOutlineSave } from "react-icons/ai";
import styled from "styled-components";
import { ElementList } from "../../utils/react-iteration";
import { StyledToolsSection } from "../Editor/EditTableStage.styles";
import { RegistryGrid } from "./components/RegistryGrid";
import { RegistrySearch } from "./components/RegistrySearch";
import { WorkerRegisterForm } from "./components/WorkerRegisterForm";
import { WorkerRegistryView } from "./components/WorkerRegistryView";
import { mockedWorkers } from "./mock";
import { WorkerRegistriesProvider } from "./workers.ctx";

export default function Configuration() {
  return (
    <StyledConfiguration>
      <StyledToolsSection>
        <button><AiOutlineSave />Salvar</button>
      </StyledToolsSection>
      <div className="body">
        <WorkerRegisterForm />
        <StyledVerticalLine />
        <section className="search-section">
          <WorkerRegistriesProvider>
            <RegistrySearch />
            <RegistryGrid>
              <ElementList
                Component={WorkerRegistryView}
                iter={mockedWorkers} />
            </RegistryGrid>
          </WorkerRegistriesProvider>
        </section>
      </div>
    </StyledConfiguration >
  );
}

export const StyledVerticalLine = styled.span`
  width: 1px;
  background-color: #0002;
`;

export const StyledConfiguration = styled.div`
  width: 100%;
  height: 100%;
  align-items: stretch;
  flex-direction: column;
  display: flex;

  &>.body {
    flex: 2;
    display: flex;
    padding: .75rem;
    box-sizing: border-box;
    gap: .75rem;
  
    &>.search-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }
  }
`;