export function sleep(ms: number = 0) {
  return new Promise<void>(res => setTimeout(res, ms));
}