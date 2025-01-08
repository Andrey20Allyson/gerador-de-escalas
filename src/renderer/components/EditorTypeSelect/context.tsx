import { DutyTableGrid } from "../../components/DutyTableGrid";
import { createRouterContext, InferRoutes } from "../../contexts/router";
import { WorkerList } from "../WorkerList";
import { NotSelected } from "./utils";

export const EditorRouterContext = createRouterContext(
  {
    DutyTableGrid,
    NotSelected,
    WorkerList,
  },
  "NotSelected",
  {},
);

export type Routes = InferRoutes<typeof EditorRouterContext>;
