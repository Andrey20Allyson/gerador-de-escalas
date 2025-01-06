import prompt from "prompt";
import {
  WorkerRegistryInit,
  WorkerRegistryGender,
} from "src/lib/persistence/entities/worker-registry";

prompt.message = "";

const NAME_INPUT: InputConfig = {
  name: "Nome",
  tip: "Insira o nome do agente",
};

const WOKRER_ID_INPUT: InputConfig = {
  name: "Matricula",
  tip: "Insira a matrícula do agente (Formato: 000000-0)",
  pattern: /\d+-\d/,
  message: "Formato esperado: 000000-0",
};

const INDIVIDUAL_ID_INPUT: InputConfig = {
  name: "CPF",
  tip: "Insira o CPF do agente (Formato: 000.000.000-00)",
  pattern: /\d{3}\.\d{3}\.\d{3}-\d{2}/,
  message: "Formato esperado: 000.000.000-00",
};

const GENDER_INPUT: InputConfig = {
  name: "Genero",
  tip: "Insira o gênero do agente (M para macho e F para fêmea)",
  pattern: /M|F/,
  message: "Formato esperado: F ou M",
};

export async function loadWorkerByPromptInput(): Promise<WorkerRegistryInit[]> {
  const name = await input(NAME_INPUT);
  const workerId = await input(WOKRER_ID_INPUT);
  const individualId = await input(INDIVIDUAL_ID_INPUT);
  const gender = (await input(GENDER_INPUT)) as WorkerRegistryGender;

  const registry: WorkerRegistryInit = { name, workerId, individualId, gender };

  return [registry];
}

type InputConfig = {
  name: string;
  tip: string;
  pattern?: RegExp;
  message?: string;
};

async function input(config: InputConfig) {
  const { name, tip, message, pattern } = config;

  console.log(tip);

  const { [name]: value } = await prompt.get({
    name,
    pattern,
    message,
    required: true,
    type: "string",
  });
  if (typeof value != "string") throw new Error(`'${name}' é obrigatório!`);

  return value as string;
}
