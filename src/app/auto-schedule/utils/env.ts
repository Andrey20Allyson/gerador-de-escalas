import dotenv from 'dotenv';

dotenv.config()

export function env(key: string): string {
    const variable = process.env[key];
    
    if (variable == null) {
      throw new Error(`env '${key}' is mandatory!`);
    }

    return variable;
}

export module env {
  export function optional(key: string): string | null {
    const variable = process.env[key];

    if (variable == null) {
      return null;
    }

    return variable;
  } 
}
