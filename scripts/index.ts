import { program, Command } from "commander";
import { CryptorProgramInitializer } from "./initializers/cryptor";
import { DevBuildProgramInitializer } from "./initializers/dev-build";
import { ProdBuildProgramInitializer } from "./initializers/prod-bundle";

export interface ProgramInitializer {
  initialize(program: Command): void;
}

const initializers: ProgramInitializer[] = [];

initializers.push(new CryptorProgramInitializer());
initializers.push(new DevBuildProgramInitializer());
initializers.push(new ProdBuildProgramInitializer());

for (const initializer of initializers) {
  initializer.initialize(program);
}

program.parse();