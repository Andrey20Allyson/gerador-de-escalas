import { GrStatusUnknown } from "react-icons/gr";
import { PiGenderFemaleBold, PiGenderMaleBold } from "react-icons/pi";
import { Gender, Graduation } from "../extra-duty-lib";
import React from "react";

export const genderComponentMap: Record<Gender, () => React.JSX.Element> = {
  [Gender.FEMALE]: () => <PiGenderFemaleBold color='#de63e2' />,
  [Gender.MALE]: () => <PiGenderMaleBold color='#5b4af5' />,
  [Gender.UNDEFINED]: () => <GrStatusUnknown />,
};

export const graduationTextColorMap: Record<Graduation, string> = {
  [Graduation.INSP]: '#047400',
  [Graduation.GCM]: '#000000',
  [Graduation.SI]: '#a7aa00',
}