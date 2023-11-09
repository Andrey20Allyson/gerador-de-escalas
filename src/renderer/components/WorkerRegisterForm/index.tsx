import { WorkerRegistry } from "@gde/app/base";
import Form, { FormController } from "@gde/renderer/components/Form";
import { parsers } from "@gde/renderer/components/Form/context/parsing";
import { CPFParser } from "@gde/renderer/components/Form/context/parsing/cpf";
import React from "react";
import { AiOutlineCloudUpload, AiOutlineDelete } from "react-icons/ai";
import styled from "styled-components";

export interface WorkerRegisterFormProps {
  onSubmit?: (worker: WorkerRegistry) => void;
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