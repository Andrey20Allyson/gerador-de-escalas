import styled, { css } from "styled-components";
import { Graduation, Gender } from "../extra-duty-lib";

export const StyledExpandDayButton = styled.button`
  background-color: #ffffff22;
  cursor: pointer;
  outline: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 1.4rem;
  padding: 0;
  width: 1.8rem;
  border-radius: .2rem;
  transition: opacity 100ms;
  box-shadow:
    .1rem -.1rem .5rem #0002 inset,
    -.1rem .1rem .5rem #ffffff58 inset;

  &>svg {
    width: 100%;
    height: 100%;
  }

  &:hover {
    opacity: .7;
  }
`;

export const StyledDayViewGrid = styled.div`
  display: grid;
  gap: .3rem;
  grid-template-columns: repeat(7, 1fr);
  /* position: relative; */
`;

export const StyledDay = styled.div`
  height: 4rem;
  width: 6rem;
  background-color: #cecece;
  box-shadow: -.1rem .1rem .2rem #0004;
  padding: .3rem;
  gap: .2rem;
  border-radius: .2rem;
  display: flex;
  flex-direction: column;
`;

export const StyledDayTitle = styled.h3`
  margin: 0;
  flex: .7;
  font-size: .9rem;
`;

export const StyledDutiesContainer = styled.div`
  display: flex;
  gap: .2rem;
  flex: 1;
`;

export const StyledDuty = styled.div`
  background-color: #bebebe;
  flex: 1;
  display: flex;
  flex-direction: column-reverse;
  box-shadow: -.1rem .1rem .2rem #0004 inset;
  justify-content: end;
  gap: 2px;
  padding: .2rem;
  border-radius: .2rem;
`;

export const StyledDutyHeader = styled.section`
  justify-content: space-between;
  align-items: center;
  display: flex;
  flex: .7;

  &>svg {
    cursor: pointer;
  }
`;

export const StyledDutyTitle = styled.h4`
  margin: 0;
  text-align: center;
  font-size: .6rem;
`;

export const dutySlotStyles = css`
  height: 5px;
  width: 100%;
  overflow: hidden;
  border-radius: .1rem;
`;

export interface StyledDutySlotProps {
  graduation: Graduation;
  gender: Gender;
}

export const graduationColorMap: Record<Graduation, string> = {
  [Graduation.INSP]: '#71eb8a',
  [Graduation.GCM]: '#313131',
  [Graduation.SI]: '#f0d35e',
};

export const genderColorMap: Record<Gender, string> = {
  [Gender.UNDEFINED]: '#727272',
  [Gender.FEMALE]: '#de63e2',
  [Gender.MALE]: '#5b4af5',
}

export const StyledDutySlot = styled.span<StyledDutySlotProps>`
  ${dutySlotStyles}
  display: flex;
  background-color: ${({ graduation }) => graduationColorMap[graduation]};

  &::before {
    content: '';
    background-color: ${({ gender }) => genderColorMap[gender]};
    width: 20%;
    height: 100%;
    border-width: 1px;
    border-right-style: solid;
    border-color: #ffffff97;
  }
`;

export const StyledEmpityDutySlot = styled.span`
  ${dutySlotStyles}
  background-color: #a0a0a0;
`;