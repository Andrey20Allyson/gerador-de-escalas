export enum ErrorCode {
  DATA_NOT_LOADED = 'app:data-not-loaded-error',
  INVALID_INPUT = 'app:invalid-input-error',
  UNKNOW = 'app:unknow-error',
}

export enum FSErrorCode {
  READ = 'file-system:read-error',
  WRITE = 'file-system:write-error',
}

export type AppErrorType<TCode = ErrorCode.UNKNOW> = {
  code: TCode | ErrorCode.UNKNOW;
  callstack?: string;
  type: 'app-error';
  message: string;
};

export class AppError {
  static create<TCode>(
    message: string,
    code: TCode | ErrorCode.UNKNOW = ErrorCode.UNKNOW,
    callstack?: string
  ): AppErrorType<TCode> {
    return {
      type: 'app-error',
      callstack,
      message,
      code,
    };
  }

  static parse(error: unknown): AppErrorType {
    if (error instanceof Error) {
      return AppError.create(error.message, ErrorCode.UNKNOW, error.stack);
    }

    return AppError.create(JSON.stringify(error));
  }

  static stringify(error: AppErrorType<unknown>, withCallstack = false) {
    return `Error code [${error.code}]: ${error.message}${withCallstack ? `\n${error.callstack}` : ''}`;
  }

  static log(error: AppErrorType<unknown>) {
    console.error(this.stringify(error, true));

    if ('alert' in globalThis) {
      alert(this.stringify(error));
    }
  }
}

export type AppResponseType<TData = void, TErrorCode = ErrorCode.UNKNOW> = {
  ok: false,
  error: AppErrorType<TErrorCode>;
} | {
  ok: true;
  data: TData;
};

export class AppResponse {
  static ok<TError>(): AppResponseType<void, TError>;
  static ok<TData, TError>(data: TData): AppResponseType<TData, TError>;
  static ok<TData, TError>(data?: TData): AppResponseType<TData, TError> {
    return {
      ok: true,
      data: data as TData,
    };
  }

  static error<TData, TCode = ErrorCode.UNKNOW>(
    message: string,
    code: TCode | ErrorCode.UNKNOW = ErrorCode.UNKNOW,
    callstack?: string
  ): AppResponseType<TData, TCode> {
    return {
      ok: false,
      error: AppError.create(message, code, callstack),
    };
  }
}