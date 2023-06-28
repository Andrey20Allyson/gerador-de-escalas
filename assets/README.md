# Este diretório deve receber os seguinte arquivos:

## "registries.json"

Esse arquivo é um json que implementa um `Array` de objetos do seguinte tipo:

```ts
type Registries = {
  individualID: string;
  workerID: string;
  name: string;
};
```

Sendo `individualID` o CPF do funcionário e `workerID` a sua matricula.

## "output-pattern.xlsx"

Esse arquivo deve ser um `XLSX` que contem uma aba com o nome 'DADOS'. Ele será utilizado para inserir os dados de saída em um formato padronizado.

## "holidays.json"

Esse arquivo é um json que implementa um `Array` de objetos do seguinte tipo:

```ts
type Holiday = {
  name: string;
  day: number;
  month: number;
};
```