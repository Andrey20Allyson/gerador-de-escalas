interface AppAPI {
  generate(filePath: string, sheetName: string, month: number): Promise<Uint8Array>;
  getSheetNames(filePath: string): Promise<string[]>;
}

interface Window {
  api: AppAPI; 
}