import { api, AppError } from "../../api";
import { useWorkerRegistriesService } from "../../pages/Configuration/workers.ctx";
import { IterProps } from "../../utils/react-iteration";
import React from "react";
import { GoPencil, GoTrash } from "react-icons/go";
import { StyledWorkerRegistryView } from "./styles";
import { WorkerRegistry } from "../../../apploader/auto-schedule/persistence/entities/worker-registry";

export function WorkerRegistryView(props: IterProps<WorkerRegistry>) {
  const service = useWorkerRegistriesService();

  const {
    isCoordinator,
    individualId,
    workerId,
    gender,
    name,
  } = props.entry;

  async function handleDelete() {
    const result = await api.config.workers.delete(workerId);

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
            {workerId}
          </strong>
        </p>
        <p>
          CPF:
          <strong>
            {individualId}
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