import { Result } from "./utils";
import { ValueParser } from "./value-parser";

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

  isValidationDigitCorrect(digits: Uint8Array, index: 0 | 1): boolean {
    if (digits.length < 11) return false;

    const validationDigit = digits[9 + index];
    const iterationLength = 9 + index;
    const multiplicationStart = 1 - index;

    let sum = 0;
    for (let i = 0; i < iterationLength; i++) {
      sum += digits[i] * (i + multiplicationStart);
    }

    const rest = sum % 11;
    const digit = rest >= 10 ? 0 : rest;

    return digit === validationDigit;
  }

  isValidationDigitsCorrect(digits: Uint8Array): boolean {
    return this.isValidationDigitCorrect(digits, 0)
      && this.isValidationDigitCorrect(digits, 1);
  }

  isValidationDigitsValid(digits: Uint8Array): Result<Uint8Array> {
    const isValid = this.isValidationDigitsCorrect(digits)

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

  validateCPF(cpf: string): Result<Uint8Array> {
    const digits = this.parseDigits(cpf);
    if (digits.type === 'error') return digits;

    return this.isValidationDigitsValid(digits.value);
  }

  parse(cpf: string): Result<string> {
    const validationResult = this.validateCPF(cpf);

    if (validationResult.type === 'value') {
      return this.ok(cpf);
    } else {
      return validationResult;
    }
  }
}