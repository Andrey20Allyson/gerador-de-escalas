export function getElement(id: string) {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Can't find #${id}`);
  return element;
}

export function getInput(id: string) {
  const element = getElement(id);
  if (!(element instanceof HTMLInputElement)) throw new Error(`Can't find input#${id}`);

  return element;
}

export function getSelect(id: string) {
  const element = getElement(id);
  if (!(element instanceof HTMLSelectElement)) throw new Error(`Can't find select#${id}`);

  return element;
}

export function createOption(value: string) {
  const option = document.createElement('option');

  option.value = value;
  option.innerText = value;

  return option;
}