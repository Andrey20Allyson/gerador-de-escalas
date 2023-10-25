export enum ErrorCode {
  DATA_NOT_LOADED = 'app:data-not-loaded-error',
  INVALID_INPUT = 'app:invalid-input-error',
  UNKNOW = 'app:unknow-error',
}

export enum FSErrorCode {
  READ = 'file-system:read-error',
  WRITE = 'file-system:write-error',
}

export type AppError<TCode = ErrorCode.UNKNOW> = {
  code: TCode | ErrorCode.UNKNOW;
  callstack?: string;
  type: 'app-error';
  message: string;
};

export namespace AppError {
  export function create<TCode>(
    message: string,
    code: TCode | ErrorCode.UNKNOW = ErrorCode.UNKNOW,
    callstack?: string
  ): AppError<TCode> {
    return {
      type: 'app-error',
      callstack,
      message,
      code,
    };
  }

  export function parse(error: unknown): AppError {
    if (error instanceof Error) {
      return AppError.create(error.message, ErrorCode.UNKNOW, error.stack);
    }

    return AppError.create(JSON.stringify(error));
  }

  export function stringify(error: AppError<unknown>, withCallstack = false) {
    return `Error code [${error.code}]: ${error.message}${withCallstack ? `\n${error.callstack}` : ''}`;
  }

  export function log(error: AppError<unknown>) {
    console.error(AppError.stringify(error, true));

    if ('alert' in globalThis) {
      alert(AppError.stringify(error));
    }
  }
}