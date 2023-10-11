import React from "react";
import { AiOutlineCloudUpload, AiOutlineDelete } from "react-icons/ai";
import styled from "styled-components";
import { WorkerRegistry } from "../../../../../app/base";
import Form from "../Form";
import { FormController } from "../Form";
import { Result, ValueParser, parsers } from "../Form/context/parsing";
import { CustomParser } from "../Form/context/parsing/custom";

export interface WorkerRegisterFormProps {
  onSubmit?: (worker: WorkerRegistry) => void;
}

export type CPFParserEMM = {
  INVALID_CPF: string;
};

export class CPFParser extends ValueParser<string, string, CPFParserEMM>  {
  constructor() {
    super({
      INVALID_CPF: 'cpf $0 é inválido!, motivo: "$1"',
    });
  }

  isCPFFormatValid(cpf: string): boolean {
    return /\d{3}\.\d{3}\.\d{3}-\d{2}/.test(cpf);
  }

  isValidationDigitValid(digits: Uint8Array, offset: 0 | 1): boolean {
    if (digits.length < 11) return false;

    const verifierDigit = digits[9 + offset];
    const sumLength = 9 + offset;
    const digitMultplier = 10 + offset;

    let sum = 0;
    for (let i = 0; i < sumLength; i++) {
      sum += digits[i] * (digitMultplier - i);
    }

    const rest = 11 - (sum % 11);
    const digit = (rest >= 10) ? 0 : rest;

    return digit === verifierDigit;
  }

  isValidationDigitsValid(digits: Uint8Array): Result<Uint8Array> {
    const isValid = this.isValidationDigitValid(digits, 0)
      && this.isValidationDigitValid(digits, 1);

    if (isValid) {
      return Result.ok(digits);
    } else {
      return Result.error('invalid cpf digits');
    }
  }

  parseDigits(cpf: string): Result<Uint8Array> {
    if (!this.isCPFFormatValid(cpf)) return Result.error('invalid cpf format');

    const digits = new Uint8Array(11);
    let digitCount = 0;

    for (let i = 0; i < cpf.length; i++) {
      const char = cpf.charAt(i);
      const digit = parseInt(char);

      if (!isNaN(digit)) {
        digits[digitCount++] = digit;
      }
    }

    if (digitCount < 11) return Result.error('invalid cpf size');

    return Result.ok(digits);
  }

  isCPFValid(cpf: string): Result<Uint8Array> {
    const digits = this.parseDigits(cpf);
    if (digits.type === 'error') return digits;

    return this.isValidationDigitsValid(digits.value);
  }

  parse(cpf: string): Result<string> {
    if (this.isCPFValid(cpf)) {
      return this.ok(cpf);
    } else {
      return this.error('INVALID_CPF', cpf);
    }
  }
}

const NAME_PARSER = parsers.string();
const GENDER_PARSER = parsers.enum(['M', 'F']);
const CPF_PARSER = parsers.string().then(new CPFParser());

export function WorkerRegisterForm(props: WorkerRegisterFormProps) {
  const {
    onSubmit
  } = props;

  function handleSubmit(controller: FormController) {
    const [
      nameField,
      workerIDField,
      individualIDField,
      genderField,
      isCoordinatorField,
    ] = controller.fields(['name', 'workerID', 'individualID', 'gender', 'isCoordinator']);

    try {
      const name = nameField.pipe(NAME_PARSER).unwrap();
      const workerID = workerIDField.pipe(parsers.string()).unwrap();
      const individualID = individualIDField.pipe(CPF_PARSER).unwrap();
      const gender = genderField.pipe(GENDER_PARSER).unwrap();
      const isCoordinator = isCoordinatorField.pipe(parsers.boolean()).unwrap();

      onSubmit?.({
        name,
        workerID,
        individualID,
        gender,
        isCoordinator,
      });
    } catch (err) {
      console.warn(err);
    }
  }

  return (
    <StyledWorkerRegisterFormBody>
      <h2>Registrar Agente</h2>
      <Form.Root onSubmit={handleSubmit}>
        <Form.TextInput title="Nome" name="name" />
        <Form.TextInput title="CPF" name="individualID" />
        <Form.TextInput title="Matrícula" name="workerID" />
        <Form.Row separator="line">
          <Form.Select title="Genero" name="gender">
            <option value="M">Masculino</option>
            <option value="F">Feminino</option>
          </Form.Select>
          <div className="footer-collumn">
            <Form.CheckBox title="Coordenador" name="isCoordinator" />
          </div>
        </Form.Row>
        <Form.Row contentJustify="start">
          <Form.SubmitButton><AiOutlineCloudUpload />Registrar</Form.SubmitButton>
          <Form.Button onClick={controller => controller.clear()}><AiOutlineDelete /> Resetar</Form.Button>
        </Form.Row>
      </Form.Root>
    </StyledWorkerRegisterFormBody>
  );
}

export const StyledWorkerRegisterFormBody = styled.div`
  display: flex;
  flex-direction: column;

`;