import express, { Express } from 'express';
import { io, ExtraDutyTableV2 } from '@andrey-allyson/escalas-automaticas';
import xlsx from 'xlsx';
import { getSheetNamesOptionsSchema, scheduleGeneratorOptionsSchema } from './schemas';
import { Routes } from './routes';

export function loadApi(server: Express) {
  server.use('/api', express.json());

  server.get(Routes.GET_SHEET_NAMES, async (req, res) => {
    try {
      const result = getSheetNamesOptionsSchema.safeParse(req.query);
      if (!result.success) return res.status(400).json(result);

      const { filePath } = result.data;

      const book = await io.loadBook(filePath);

      res.json(book.SheetNames);
    } catch (e) {
      console.error(e);
      res.status(500).send(String(e));
    }
  });

  server.get(Routes.SCHEDULE_GENERATOR, async (req, res) => {
    try {
      const result = scheduleGeneratorOptionsSchema.safeParse(req.query);
      if (!result.success) return res.status(400).json(result);

      const { filePath, month, sheetName } = result.data;

      const workers = await io.loadWorkers(filePath, sheetName);
      const table = new ExtraDutyTableV2({ month: +month });

      table.tryAssignArrayMultipleTimes(workers, 400);

      const body = io.toSheetBody(Array.from(table.entries()));
      const book = xlsx.utils.book_new();
      const sheet = xlsx.utils.aoa_to_sheet(body);

      xlsx.utils.book_append_sheet(book, sheet, 'Main');

      const data = xlsx.write(book, { type: 'buffer' });

      res.send(data);
    } catch (e) {
      console.error(e);
      res.status(500).send(String(e));
    }
  });

  return server;
}