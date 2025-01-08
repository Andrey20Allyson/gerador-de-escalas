import { useDayEditionModal } from "../../components/DayEditionModal";
import { firstMondayFromYearAndMonth, iterRange } from "../../utils";
import { ElementList } from "../../utils/react-iteration";
import React from "react";
import { StyledDayEditionGrid } from "./styles";
import { DayView } from "./utils";
import { TableEditorController } from "../../state/controllers/editor/table";

export function DutyTableGrid() {
  const modal = useDayEditionModal();
  const tableController = new TableEditorController();

  function openModal(dutyId: number) {
    modal.open({ dutyId });
  }

  const firstMonday = tableController.getMonth().getFirstMonday();
  const firstSunday = (firstMonday + 7 - 1) % 7;

  return (
    <StyledDayEditionGrid>
      <p>Domingo</p>
      <p>Segunda</p>
      <p>Terça</p>
      <p>Quarta</p>
      <p>Quinta</p>
      <p>Sexta</p>
      <p>Sabado</p>
      <ElementList
        Component={() => <span></span>}
        iter={iterRange(0, 7 - firstSunday)}
      />
      <ElementList
        Component={DayView}
        iter={tableController.iterDays()}
        communProps={{
          onSelect: openModal,
        }}
      />
    </StyledDayEditionGrid>
  );
}
