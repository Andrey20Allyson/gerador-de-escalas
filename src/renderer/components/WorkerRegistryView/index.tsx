import { AppError, RegistryEntryType, WorkerRegistry } from "@gde/app/base";
import { api } from "@gde/renderer/api";
import { useWorkerRegistriesService } from "@gde/renderer/pages/Configuration/workers.ctx";
import { IterProps } from "@gde/renderer/utils/react-iteration";
import React from "react";
import { GoPencil, GoTrash } from "react-icons/go";
import { StyledWorkerRegistryView } from "./styles";

export function WorkerRegistryView(props: IterProps<RegistryEntryType<WorkerRegistry>>) {
  const service = useWorkerRegistriesService();

  const {
    data: {
      isCoordinator,
      individualID,
      workerID,
      gender,
      name,
    },
    id
  } = props.entry;

  async function handleDelete() {
    const result = await api.config.workers.delete(id);

    if (!result.ok) {
      AppError.log(result.error);
      return;
    }

    service.refresh();
  }

  return (
    <StyledWorkerRegistryView>
      <span className="left-col">
        <h2>{name}</h2>
        <p>
          Matrícula:
          <strong>
            {workerID}
          </strong>
        </p>
        <p>
          CPF:
          <strong>
            {individualID}
          </strong>
        </p>
        <p>
          Gênero:
          <strong>
            {gender}
          </strong>
        </p>
        {isCoordinator ? <em>Coordenador</em> : null}
      </span>
      <span className="right-col">
        <GoTrash onClick={handleDelete} />
        <GoPencil />
      </span>
    </StyledWorkerRegistryView>
  );
}