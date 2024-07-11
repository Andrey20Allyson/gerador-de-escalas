import dotenv from 'dotenv';

dotenv.config()

export function env(key: string) {
    const variable = process.env[key];
    
    if (variable == null) {
      throw new Error(`env '${key}' is mandatory!`);
    }

    return variable;
}
