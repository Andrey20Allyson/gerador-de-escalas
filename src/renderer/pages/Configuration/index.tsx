import { AppError, WorkerRegistry } from "@gde/app/base";
import { api } from "@gde/renderer/api";
import { RegistryGrid } from "@gde/renderer/components/RegistryGrid";
import { RegistrySearch } from "@gde/renderer/components/RegistrySearch";
import { WorkerRegisterForm } from "@gde/renderer/components/WorkerRegisterForm";
import { WorkerRegistryView } from "@gde/renderer/components/WorkerRegistryView";
import { StyledToolsSection } from "@gde/renderer/pages/Editor/EditTableStage.styles";
import { ElementList } from "@gde/renderer/utils/react-iteration";
import React from "react";
import { AiOutlineSave } from "react-icons/ai";
import styled from "styled-components";
import { WorkerRegistriesProvider, useWorkerRegistriesService } from "./workers.ctx";

export default function ConfigurationPage() {
  return (
    <WorkerRegistriesProvider>
      <Configuration />
    </WorkerRegistriesProvider>
  );
}

export function Configuration() {
  const service = useWorkerRegistriesService();

  async function createWorker(workerRegistry: WorkerRegistry) {
    const result = await api.config.workers.create(workerRegistry);

    if (!result.ok) {
      AppError.log(result.error);
      return;
    }

    service.refresh();
  }

  return (
    <StyledConfiguration>
      <StyledToolsSection>
        <button><AiOutlineSave />Salvar</button>
      </StyledToolsSection>
      <div className="body">
        <WorkerRegisterForm onSubmit={createWorker} />
        <StyledVerticalLine />
        <section className="search-section">
          <RegistrySearch />
          <WorkerRegistryGrid />
        </section>
      </div>
    </StyledConfiguration >
  );
}

export interface WorkerRegistryListProps { }

export function WorkerRegistryGrid(props: WorkerRegistryListProps) {
  const service = useWorkerRegistriesService();

  return (
    <RegistryGrid>
      <ElementList
        Component={WorkerRegistryView}
        iter={service.list()} />
    </RegistryGrid>
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