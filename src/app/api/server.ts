import { generate, io } from '@andrey-allyson/escalas-automaticas';
import express, { Express, Response } from 'express';
import fs from 'fs/promises';
import { Routes } from './routes';
import { getSheetNamesOptionsSchema, scheduleGeneratorOptionsSchema } from './schemas';

function handleError(err: unknown, response: Response, dev = false): void {
  if (dev) console.log(err);

  if (err instanceof Error) {
    response.status(500).send({
      errorName: err.name,
      message: err.message,
      ...(dev && {
        stack: err.stack,
        cause: err.cause,
      }),
    });
    return;
  }

  response.status(500).send(String(err));
}

export function loadApi(server: Express, dev = false) {

  server.use('/api', express.json());

  server.get(Routes.GET_SHEET_NAMES, async (req, res) => {
    try {
      const result = getSheetNamesOptionsSchema.safeParse(req.query);
      if (!result.success) return res.status(400).json(result);

      const { filePath } = result.data;

      const sheetNames = await io.loadSheetNames(filePath);

      res.json(sheetNames);
    } catch (err) {
      handleError(err, res, dev);
    }
  });

  server.get(Routes.SCHEDULE_GENERATOR, async (req, res) => {
    try {
      const result = scheduleGeneratorOptionsSchema.safeParse(req.query);
      if (!result.success) return res.status(400).json(result);

      const { filePath, month, sheetName } = result.data;

      const input = await fs.readFile(filePath);
      const output = generate(input, {
        month: +month,
        inputSheetName: sheetName,
        outputSheetName: 'Main',
      });

      res.send(output);
    } catch (err) {
      handleError(err, res, dev);
    }
  });

  return server;
}