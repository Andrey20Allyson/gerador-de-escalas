import React from "react";
import { AiOutlineCloudUpload, AiOutlineDelete } from "react-icons/ai";
import styled from "styled-components";
import { WorkerRegistry } from "../../../../../app/base";
import Form from "../Form";
import { FormController } from "../Form";
import { parsers } from "../Form/context/parsing";

export interface WorkerRegisterFormProps {
  onSubmit?: (worker: WorkerRegistry) => void;
}

const NAME_PARSER = parsers.string()
  .then(parsers.regexp(/^[\w .]*$/));

export function WorkerRegisterForm(props: WorkerRegisterFormProps) {
  function handleSubmit(controller: FormController) {
    const [nameField, workerIDField, individualIDField] = controller.fields(['name', 'workerID', 'individualID']);

    try {
      const name = nameField.pipe(NAME_PARSER).unwrap();

      console.log(name);
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
          <Form.Select title="Graduação" name="graduation">
            <option value="M">Masculino</option>
            <option value="F">Feminino</option>
          </Form.Select>
          <Form.Select title="Graduação" name="graduation">
            <option value="gcm">GCM</option>
            <option value="sub-insp">Sub Inspetor</option>
            <option value="insp">Inspetor</option>
          </Form.Select>
          <div className="footer-collumn">
            <label>Coodenador</label>
            <input type="checkbox" onChange={ev => console.log(ev.currentTarget.checked)} />
          </div>
        </Form.Row>
        <Form.Row contentJustify="start">
          <Form.SubmitButton><AiOutlineCloudUpload />Registrar</Form.SubmitButton>
          <Form.SubmitButton><AiOutlineDelete /> Resetar</Form.SubmitButton>
        </Form.Row>
      </Form.Root>
    </StyledWorkerRegisterFormBody>
  );
}

export const StyledWorkerRegisterFormBody = styled.div`
  display: flex;
  flex-direction: column;

`;