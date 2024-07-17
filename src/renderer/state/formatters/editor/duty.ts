import { DutyData } from "../../../../app/api/table-reactive-edition/table";

export class DutyFormatter {
  private readonly dutyTitles = [
    '1 as 7h',
    '7 as 13h',
    '13 as 19h',
    '19 as 1h',
  ];

  constructor(private readonly duty: DutyData) { }
  
  title(): string {
    const index = this.duty.index % this.dutyTitles.length;
    
    return this.dutyTitles.at(index)!;
  }
}