import { ErrorCode, AppError } from "./error";

export type AppResponse<TData = void, TErrorCode = ErrorCode.UNKNOW> = {
  ok: false,
  error: AppError<TErrorCode>;
} | {
  ok: true;
  data: TData;
};

export namespace AppResponse {
  export function ok<TError>(): AppResponse<void, TError>;
  export function ok<TData, TError>(data: TData): AppResponse<TData, TError>;
  export function ok<TData, TError>(data?: TData): AppResponse<TData, TError> {
    return {
      ok: true,
      data: data as TData,
    };
  }

  export function error<TData, TCode>(error: AppError): AppResponse<TData, TCode>;
  export function error<TData, TCode = ErrorCode.UNKNOW>(
    message: string,
    code?: TCode | ErrorCode.UNKNOW,
    callstack?: string
  ): AppResponse<TData, TCode>;

  export function error<TData, TCode = ErrorCode.UNKNOW>(
    messageOrError: string | AppError<TCode>,
    code?: TCode | ErrorCode.UNKNOW,
    callstack?: string
  ): AppResponse<TData, TCode> {
    const error = typeof messageOrError === 'object'
      ? messageOrError
      : AppError.create(messageOrError, code ?? ErrorCode.UNKNOW, callstack);

    return {
      ok: false,
      error,
    };
  }
}