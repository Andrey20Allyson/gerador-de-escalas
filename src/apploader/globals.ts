interface Window {
  resource: (name: string, ...args: any[]) => Promise<unknown>;
}
