import { executeGenerator, getSheetNames } from "../app/api/client";
import { createOption, getInput, getSelect } from "./utils/dom";
import { saveFile } from "./utils/save-file";

function main() {
  const fileInput = getInput('file-input');
  const monthInput = getInput('month-input');
  const sheetNameSelect = getSelect('sheet-name-select');

  const confirm = getInput('submit-file');

  if (!(fileInput instanceof HTMLInputElement)) throw Error(`fileInput don't is instance of HTMLInputElement!`);
  if (fileInput.files === null) throw Error(`fileInput don't recive files!`);

  fileInput.addEventListener('input', async (ev) => {
    const file = fileInput.files?.item(0);

    const sheetNames = file ? await getSheetNames({ filePath: file.path }).catch(err => ({err})) : [];

    if ('err' in sheetNames) {
      alert(sheetNames);
      return;
    }

    sheetNameSelect.replaceChildren(...sheetNames.map(createOption));
  });

  confirm.addEventListener('click', async (ev) => {
    const file = fileInput.files?.item(0);

    fileInput.classList.remove('error');
    monthInput.classList.remove('error');
    
    if (!file) {
      alert('Escala do Mês deve receber um arquivo!');
      fileInput.classList.add('error');
      return;
    }
    
    if (monthInput.valueAsDate === null) {
      alert('Mês é um campo obrigatório');
      monthInput.classList.add('error');
      return;
    }

    const filePath = file.path;

    const result = await executeGenerator({
      filePath,
      month: monthInput.valueAsDate.getMonth().toString(),
      sheetName: sheetNameSelect.value,
    }).catch(err => ({err}));

    if ('err' in result) {
      alert(result.err);
      return;
    }

    saveFile('result.xlsx', result);
  });
}

main();