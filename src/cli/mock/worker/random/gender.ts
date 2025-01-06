import { Gender } from "../../../../extra-duty-lib";

export function randomGender(): Exclude<Gender, "N/A"> {
  const choice = Math.random();

  return choice < 0.3 ? "female" : "male";
}
