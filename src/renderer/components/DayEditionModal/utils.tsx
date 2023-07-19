import { GrStatusUnknown } from "react-icons/gr";
import { PiGenderFemaleBold, PiGenderMaleBold } from "react-icons/pi";
import { Gender, Graduation } from "../../extra-duty-lib";
import React from "react";

export const genderComponentMap: Record<Gender, () => React.JSX.Element> = {
  'female': () => <PiGenderFemaleBold color='#de63e2' />,
  'male': () => <PiGenderMaleBold color='#5b4af5' />,
  'N/A': () => <GrStatusUnknown />,
};

export const graduationTextColorMap: Record<Graduation, string> = {
  'sub-insp': '#a7aa00',
  'insp': '#047400',
  'gcm': '#000000',
}