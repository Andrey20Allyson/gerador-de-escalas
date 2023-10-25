import { program, Command } from "commander";
import { CryptorProgramInitializer } from "./initializers/cryptor";
import { DevBuildProgramInitializer } from "./initializers/dev-build";
import { ProdBundleProgramInitializer } from "./initializers/prod-bundle";

export interface ProgramInitializer {
  initialize(program: Command): void;
}

const initializers: ProgramInitializer[] = [];

initializers.push(new CryptorProgramInitializer());
initializers.push(new DevBuildProgramInitializer());
initializers.push(new ProdBundleProgramInitializer());

for (const initializer of initializers) {
  initializer.initialize(program);
}

program.parse();