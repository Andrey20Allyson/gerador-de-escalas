import { DateData, TableData } from "../../../../app/api/table-reactive-edition/table";

export class DateFormatter {
  constructor(private readonly table: TableData, private readonly date: DateData) { }
  
  day() {
    const { day, month } = this.date;

    const formattedDay = (day + 1).toString().padStart(2, '0');
    const formattedMonth = (month + 1).toString().padStart(2, '0');

    if (month !== this.table.config.month) {
      return `Dia ${formattedDay}/${formattedMonth}`;
    }

    return `Dia ${formattedDay}`;
  }
}