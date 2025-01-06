import { OrdinaryInfo } from "../../../../apploader/api/table-reactive-edition/table";

export class OrdinaryFormatter {
  constructor(readonly ordinary: OrdinaryInfo) { }

  officeHour(): string {
    const start = (this.ordinary.startsAt % 24).toString().padStart(2, '0');
    const end = (this.ordinary.endsAt % 24).toString().padStart(2, '0');
    
    return `${start} às ${end}h`
  }

  duration(): string {
    const { duration } = this.ordinary;

    return `${duration} horas`;
  }
}