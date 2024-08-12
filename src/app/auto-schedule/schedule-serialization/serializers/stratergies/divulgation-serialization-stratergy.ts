import ExcelJS from 'exceljs';
import { ExtraDutyTable, ExtraDutyTableEntry } from "../../../extra-duty-lib";
import { enumerate } from "../../../utils";
import { SerializationStratergy } from "../serialization-stratergy";
import { DayGrid, DayGridFromatter } from './utils/day-grid-formatter';
import { WorkerDutiesBuilder } from './utils/worker-duties-builder';

export class DivulgationSerializationStratergy implements SerializationStratergy {
  readonly label = ['TURNO', 'NOME', 'MATRÍCULA'];
  readonly titleFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDDDDD' } };
  readonly labelFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFEFEF' } };
  readonly primaryFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } };
  readonly secondaryFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEFEFE' } };

  readonly boldFont: Partial<ExcelJS.Font> = { bold: true };
  readonly centerHorizontalAlignment: Partial<ExcelJS.Alignment> = { horizontal: 'center' };

  constructor(readonly sheetName: string = 'DADOS') { }

  async execute(table: ExtraDutyTable): Promise<Buffer> {
    const book = new ExcelJS.Workbook();
    const sheet = book.addWorksheet(this.sheetName);

    let rowStartI = 1;
    for (const grid of this._iterGrids(table)) {
      let lastRow = rowStartI + grid.entries.length + 3;

      const startPage = pageFromRow(rowStartI);
      const endPage = pageFromRow(lastRow - 2);

      if (startPage < endPage) {
        rowStartI = firstRowFromPage(endPage);

        lastRow = rowStartI + grid.entries.length + 3;
      }

      const pageFirstRow = firstRowFromPage(startPage);

      if (rowStartI - pageFirstRow <= 1) {
        rowStartI = pageFirstRow;

        lastRow = rowStartI + grid.entries.length + 3;
      }

      let actualRow = rowStartI;

      const titleCell = sheet.getCell(actualRow++, 1);
      titleCell.value = grid.title;
      titleCell.style.font = this.boldFont;
      titleCell.style.fill = this.titleFill;

      sheet.mergeCells([actualRow - 1, 1, actualRow - 1, 3]);

      const labelRow = sheet.getRow(actualRow++);
      for (const [i, value] of enumerate(this.label)) {
        const cell = labelRow.getCell(i + 1);

        cell.style.alignment = this.centerHorizontalAlignment;
        cell.style.font = this.boldFont;
        cell.style.fill = this.labelFill;

        cell.value = value;
      }

      for (const entry of grid.entries) {
        const row = sheet.getRow(actualRow++);

        const fill = (actualRow - rowStartI) % 2 === 1 ? this.primaryFill : this.secondaryFill;

        const { duty, id, name } = entry;

        const dutyCell = row.getCell(1);

        dutyCell.value = duty;
        dutyCell.style.fill = fill;

        const nameCell = row.getCell(2);

        nameCell.value = name;
        nameCell.style.fill = fill;

        const idCell = row.getCell(3);

        idCell.value = id;
        idCell.style.alignment = this.centerHorizontalAlignment;
        idCell.style.fill = fill;
      }

      const dutySeparationRow = lastRow - grid.numOfNightly - 2;

      makeGridBorders({ sheet, start: { col: 1, row: rowStartI }, end: { col: 3, row: lastRow - 2 }, dutySeparationRow });

      rowStartI = lastRow;
    }

    const dutyCollumn = sheet.getColumn(1);
    dutyCollumn.width = fromExcelDim(20);

    const nameCollumn = sheet.getColumn(2);
    nameCollumn.width = fromExcelDim(54);

    const idCollumn = sheet.getColumn(3);
    idCollumn.width = fromExcelDim(14);

    const arrayBuffer = await book.xlsx.writeBuffer();

    return Buffer.from(arrayBuffer);
  }

  protected *_iterGrids(table: ExtraDutyTable): Iterable<DayGrid> {
    for (const day of table) {
      const builder = new WorkerDutiesBuilder();

      const workerDuties = builder.build(day);

      const formatter = new DayGridFromatter();

      yield formatter.format(day, workerDuties);
    }
  }
}

export function workerNameSorter(a: ExtraDutyTableEntry, b: ExtraDutyTableEntry): number {
  return a.worker < b.worker ? -1 : a.worker > b.worker ? 1 : 0;
}

export function parseDayIndex(index: number) {
  return (index + 1).toString().padStart(2, '0');
}

export function fromExcelDim(dim: number) {
  return dim ** 2 / (dim - .71);
}

export const defaultRowPerPage = 47;

export function pageFromRow(row: number) {
  return Math.floor((row - 1) / defaultRowPerPage);
}

export function firstRowFromPage(page: number) {
  return Math.ceil(page * defaultRowPerPage) + 1;
}

export interface SheetAddress {
  row: number;
  col: number;
}

export function createNormalBorder(): ExcelJS.Border {
  return { color: { argb: 'FF000000' }, style: 'thin' };
}

export function createMediumBorder(): ExcelJS.Border {
  return { color: { argb: 'FF000000' }, style: 'medium' };
}

export interface MakeGridBordersParams {
  dutySeparationRow: number;
  sheet: ExcelJS.Worksheet;
  start: SheetAddress;
  end: SheetAddress;
}

export const mediumBorder = createMediumBorder();
export const normalBorder = createNormalBorder();

export function makeGridBorders(params: MakeGridBordersParams) {
  const { dutySeparationRow, end, sheet, start } = params;

  for (let ri = start.row; ri <= end.row; ri++) {
    for (let ci = start.col; ci <= end.col; ci++) {
      const cell = sheet.getCell(ri, ci);

      if (ri === start.row) {
        cell.border = {
          bottom: mediumBorder,
          right: mediumBorder,
          left: mediumBorder,
          top: mediumBorder,
        };

        break;
      }

      cell.border = {
        left: ci === start.col ? mediumBorder : normalBorder,
        right: ci === end.col ? mediumBorder : normalBorder,
        top: ri === start.row ? mediumBorder : normalBorder,
        bottom: ri === dutySeparationRow || ri === end.row || ri - start.row < 2 ? mediumBorder : normalBorder,
      };
    }
  }
}