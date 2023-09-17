import React from "react";
import { AiOutlineCloudUpload, AiOutlineDelete } from "react-icons/ai";
import { WorkerRegistry } from "../../../../../app/base";
import Form, { ValueParsing, FormController, Result } from "../Form";

export interface WorkerRegisterFormProps {
  onSubmit?: (worker: WorkerRegistry) => void;
}

export function WorkerRegisterForm(props: WorkerRegisterFormProps) {
  function handleSubmit(controller: FormController) {
    const [nameField, workerIDField, individualIDField] = controller.fields(['name', 'workerID', 'individualID']);

    try {
      const result = nameField
        .pipe(ValueParsing.string)
        .pipe(ValueParsing.enumFrom(['ola', 'painho']))
        .value()
        .onError(message => nameField.warn(message))
        .unwrap();

    } catch {

    }
  }

  return (
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
          <input type="checkbox" />
        </div>
      </Form.Row>
      <Form.Row contentJustify="start">
        <Form.SubmitButton><AiOutlineCloudUpload />Registrar</Form.SubmitButton>
        <Form.SubmitButton><AiOutlineDelete /> Resetar</Form.SubmitButton>
      </Form.Row>
    </Form.Root>
  );
}