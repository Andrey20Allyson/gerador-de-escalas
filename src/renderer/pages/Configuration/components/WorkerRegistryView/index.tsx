import React from "react";
import { GoTrash, GoPencil } from "react-icons/go";
import { AppError, RegistryEntryType, WorkerRegistry } from "../../../../../app/base";
import { IterProps } from "../../../../utils/react-iteration";
import { StyledWorkerRegistryView } from "./styles";
import { useWorkerRegistriesService } from "../../workers.ctx";
import { api } from "../../../../api";

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