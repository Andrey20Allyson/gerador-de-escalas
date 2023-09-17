import React from "react";
import { GoTrash, GoPencil } from "react-icons/go";
import { WorkerRegistry } from "../../../../../app/base";
import { IterProps } from "../../../../utils/react-iteration";
import { StyledWorkerRegistryView } from "./styles";

export function WorkerRegistryView(props: IterProps<WorkerRegistry>) {
  props.entry.isCoordinator = true;

  const {
    isCoordinator,
    individualID,
    workerID,
    gender,
    name,
  } = props.entry;

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
        <GoTrash />
        <GoPencil />
      </span>
    </StyledWorkerRegistryView>
  );
}