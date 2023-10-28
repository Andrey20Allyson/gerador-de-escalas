import { Gender, Graduation } from "@gde/renderer/extra-duty-lib";
import React from "react";
import { GrStatusUnknown } from "react-icons/gr";
import { PiGenderFemaleBold, PiGenderMaleBold } from "react-icons/pi";

export const genderComponentMap: Record<Gender, () => React.JSX.Element> = {
  'female': () => <PiGenderFemaleBold color='#de63e2' />,
  'male': () => <PiGenderMaleBold color='#5b4af5' />,
  'N/A': () => <GrStatusUnknown />,
};

export const graduationTextColorMap: Record<Graduation, string> = {
  'sub-insp': '#abad00',
  'insp': '#047400',
  'gcm': '#000000',
}

export const graduationTextColor2Map: Record<Graduation, string> = {
  'sub-insp': '#fbff00',
  'insp': '#09ff00',
  'gcm': '#000000',
}