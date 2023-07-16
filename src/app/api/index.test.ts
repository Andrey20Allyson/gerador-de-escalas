import { NamedChannels } from "./channels";
import { createAPI } from "./channels/index.utils";

const api = createAPI<NamedChannels>({
  "generator.getWorkerInfo": 0,
  "generator.serialize": 0,
  "utils.getSheetNames": 0,
  "generator.generate": 0,
  "editor.getEditor": 0,
  "editor.serialize": 0,
  "generator.clear": 0,
  "generator.load": 0,
  "editor.clear": 0,
  "editor.load": 0,
  "editor.save": 0,
});

console.log(api);