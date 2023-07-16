import { io, utils } from '@andrey-allyson/escalas-automaticas';
import { MainTableFactory } from '@andrey-allyson/escalas-automaticas/dist/auto-schedule/table-factories';
import { Holidays, WorkerInfo, WorkerRegistriesMap } from '@andrey-allyson/escalas-automaticas/dist/extra-duty-lib';
import fs from 'fs/promises';
import { fromRoot } from '../path.utils';
import { AppResponse, ErrorCode } from './app.base';
import { AppHandler } from './channels';
import { EditionHandler } from './table-edition/edition-handler';
import { TableGenerator } from './table-generation/table-generator';
import { readTables } from './utils/table';

io.setFileSystem(fs);

export interface GeneratorData {
  workers: WorkerInfo[];
  sheetName: string;
  buffer: Buffer;
  month: number;
  year: number;
}

export interface LoadSheetPayload {
  sheetName: string;
  filePath: string;
}

export interface LoadDutyTablePayload {
  ordinaryTable: LoadSheetPayload;
  extraDutyTable: LoadSheetPayload;
}

export interface AppAssets {
  workerRegistryMap: WorkerRegistriesMap;
  serializer: MainTableFactory;
  holidays: Holidays;
}

async function loadAssets(): Promise<AppAssets> {
  const holidaysBuffer = await fs.readFile(fromRoot('./assets/holidays.json'));
  const patternBuffer = await fs.readFile(fromRoot('./assets/output-pattern.xlsx'));
  const registriesBuffer = await fs.readFile(fromRoot('./assets/registries.json'));
  
  const holidays = utils.Result.unwrap(Holidays.safeParse(holidaysBuffer));
  const workerRegistryMap = utils.Result.unwrap(WorkerRegistriesMap.parseJSON(registriesBuffer));
  
  const serializer = new MainTableFactory(patternBuffer);

  return { holidays, workerRegistryMap, serializer };
}

function createEditorHandler(assets: AppAssets): AppHandler['editor'] {
  const { holidays, serializer, workerRegistryMap } = assets;
  const editor = new EditionHandler();

  return {
    async clear() {
      delete editor.data;
    },

    async getEditor() {
      const result = editor.createEditor();
      if (result === ErrorCode.DATA_NOT_LOADED) return AppResponse.error('Shold load data before get editor!', result);

      return AppResponse.ok(result.data);
    },

    async load(_, payload) {
      const tables = await readTables(payload, fs);
      
      editor.load({ holidays, tables, workerRegistryMap });

      return AppResponse.ok();
    },

    async save(_, data) {
      return editor.save(data)
      ? AppResponse.ok()
      : AppResponse.error('Shold load data before save!', ErrorCode.DATA_NOT_LOADED);
    },

    async serialize() {
      const table = editor.data?.table;
      if (!table) return AppResponse.error('Shold load data before serialize!', ErrorCode.DATA_NOT_LOADED);

      const buffer = await serializer.generate(table, { sheetName: 'DADOS' });

      return AppResponse.ok(buffer.buffer);
    },
  };
}

function createGeneratorHandler(assets: AppAssets): AppHandler['generator'] {
  const { holidays, serializer, workerRegistryMap } = assets;
  const generator = new TableGenerator();

  return {
    async clear(ev) {
      throw new Error('Method not implemented');
    },
    
    async generate(ev) {
      throw new Error('Method not implemented');
    },
    
    async getWorkerInfo(ev) {
      throw new Error('Method not implemented');
    },
    
    async load(ev, payload) {
      throw new Error('Method not implemented');
    },

    async serialize(ev) {
      throw new Error('Method not implemented');
    },
  }
}

export async function loadAPI(debug = false) {
  const assets = await loadAssets();

  
}

  // handleAppIPCChannels({
  //   async clearData(ev) {
  //     loadedData = undefined;
  //   },

  //   async getLoadedTableViewerData(ev) {
  //     return loadedViewer?.data;
  //   },

  //   async loadViewer(ev, payload) {
  //     const {
  //       ordinaryTable,
  //       extraDutyTable,
  //     } = payload;

  //     try {
  //       loadedViewer = TableEditor.parse({
  //         holidays,
  //         workerRegistryMap,
  //         tables: {
  //           ordinaryTable: {
  //             buffer: await fs.readFile(ordinaryTable.filePath),
  //             sheetName: ordinaryTable.sheetName,
  //           },
  //           extraDutyTable: {
  //             buffer: await fs.readFile(extraDutyTable.filePath),
  //             sheetName: extraDutyTable.sheetName,
  //           },
  //         },
  //       });
  //     } catch (e) {
  //       return createAppError(e);
  //     }
  //   },

  //   async changeWorkerDayOfWork(ev, workerIndex, day, value) {
  //     const worker = loadedData?.workers.at(workerIndex);
  //     if (!worker) return;

  //     if (value) {
  //       worker.daysOfWork.work(day);
  //     } else {
  //       worker.daysOfWork.notWork(day);
  //     }
  //   },

  //   async getEditableMap(ev) {
  //     try {
  //       return tableEditor.createEditable();
  //     } catch (e) {
  //       return createAppError(e);
  //     }
  //   },

  //   async serializeEditedTable(ev) {
  //     try {
  //       const buffer = await tableEditor.serialize();

  //       return new Uint8Array(buffer).buffer;
  //     } catch (e) {
  //       return createAppError(e);
  //     }
  //   },

  //   async loadEditor(ev, payload) {
  //     try {
  //       const { ordinaryTable, extraDutyTable: tableToEdit } = payload;

  //       const ordinaryTableBuffer = await fs.readFile(ordinaryTable.filePath);
  //       const tableToEditBuffer = await fs.readFile(tableToEdit.filePath);

  //       tableEditor.load({
  //         ordinaryTable: {
  //           buffer: ordinaryTableBuffer,
  //           sheetName: ordinaryTable.sheetName,
  //         },
  //         extraDutyTable: {
  //           buffer: tableToEditBuffer,
  //           sheetName: tableToEdit.sheetName,
  //         },
  //       });
  //     } catch (e) {
  //       return createAppError(e);
  //     }
  //   },

  //   async saveEditorChanges(ev, changes) {
  //     try {
  //       tableEditor.save(changes);
  //     } catch (e) {
  //       return createAppError(e);
  //     }
  //   },

  //   async changeWorkerInfo(ev, index, newState) {

  //   },

  //   async generateWithLoaded(ev) {
  //     try {
  //       if (!loadedData) return GeneratorStatus.DATA_NOT_LOADED_ERROR;
  //       const { month, workers } = loadedData;

  //       const table = new ExtraDutyTableV2({ month });

  //       table.tryAssignArrayMultipleTimes(workers, 2000);
  //       // if (!success) return GeneratorStatus.ASSIGN_ERROR;

  //       if (debug) {
  //         console.log(analyseResult(table, workers));
  //       }

  //       const buffer = await tableFactory.generate(table, {
  //         sheetName: 'DADOS',
  //       });

  //       for (const worker of workers) {
  //         worker.resetPositionsLeft();
  //       }

  //       outputBuffer = new Uint8Array(buffer).buffer;

  //       return GeneratorStatus.OK;
  //     } catch (e) {
  //       console.error(e);
  //       return GeneratorStatus.UNKNOW_ERROR;
  //     }
  //   },

  //   async getGeneratedArrayBuffer(ev) {
  //     return outputBuffer;
  //   },

  //   async getLoadedData(ev) {
  //     if (!loadedData) return;

  //     return {
  //       month: loadedData.month,
  //       year: loadedData.year,
  //       workers: loadedData.workers,
  //       sheetName: loadedData.sheetName,
  //     };
  //   },

  //   async getSheetNames(ev, filePath) {
  //     return await io.loadSheetNames(filePath);
  //   },

  //   async getWorkerInfo(ev) {
  //     return loadedData?.workers;
  //   },

  //   async loadData(ev, { filePath, sheetName, year, month }) {
  //     try {
  //       const buffer = await fs.readFile(filePath);

  //       const workers = io.parseWorkers(buffer, {
  //         workerRegistryMap,
  //         sheetName,
  //         holidays,
  //         month,
  //         year,
  //       });

  //       loadedData = {
  //         sheetName,
  //         workers,
  //         buffer,
  //         month,
  //         year,
  //       };
  //     } catch (e) {
  //       if (e instanceof Error) return e;

  //       return new Error(`Unknown error: "${String(e)}"`);
  //     }
  //   },

  //   async saveWorkersDaysOfWork(ev, workers) {
  //     try {
  //       if (!loadedData) return SaveWorkersDaysOfWorkStatus.DATA_NOT_LOADED_ERROR;

  //       if (loadedData.workers.length !== workers.length) return SaveWorkersDaysOfWorkStatus.ARRAY_LENGTH_ERROR;

  //       setPrototypesOfWorkers(workers);

  //       for (let i = 0; i < workers.length; i++) {
  //         const { daysOfWork } = loadedData.workers[i];
  //         const newDaysOfWork = workers[i].config.daysOfWork;

  //         for (let day = 0; day < daysOfWork.length; day++) {
  //           if (newDaysOfWork.workOn(day)) {
  //             daysOfWork.work(day);
  //           } else {
  //             daysOfWork.notWork(day);
  //           }
  //         }
  //       }

  //       return SaveWorkersDaysOfWorkStatus.OK;
  //     } catch (e) {
  //       console.error(e);
  //       return SaveWorkersDaysOfWorkStatus.UNKNOWN_ERROR;
  //     }
  //   },
  // });