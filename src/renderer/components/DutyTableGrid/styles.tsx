import { Gender, Graduation } from "../../extra-duty-lib";
import styled, { css } from "styled-components";

export const StyledExpandDayButton = styled.button`
  background-color: #ffffff22;
  transition: opacity 100ms;
  justify-content: center;
  border-radius: .2rem;
  align-items: center;
  cursor: pointer;
  height: 1.4rem;
  outline: none;
  display: flex;
  width: 1.8rem;
  border: none;
  padding: 0;
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

export const StyledDayEditionGrid = styled.div`
  flex: 1;
  display: grid;
  gap: .3rem;
  grid-template-columns: repeat(7, 1fr);
  background-color: #fcfcfc;
  padding: .5rem 1.5rem;
  border-radius: .3rem;

  &>p {
    margin: 0;
    height: fit-content;
    align-self: flex-end;
    text-align: center;
    border-bottom: 1px solid #0003;
    user-select: none;
  }
`;

export const StyledDay = styled.div`
  flex: 1;
  min-height: 4.5rem;
  min-width: 8rem;
  background-color: #f1f1f1;
  border: 1px solid #0003;
  /* box-shadow: -.1rem .1rem .2rem #0004; */
  padding: .3rem;
  gap: .2rem;
  border-radius: .2rem;
  display: flex;
  flex-direction: column;
`;

export const StyledDayTitle = styled.h3`
  margin: 0;
  flex: 1;
  font-size: .9rem;
`;

export const StyledDutiesContainer = styled.div`
  display: flex;
  justify-content: end;
  align-items: end;
  gap: .2rem;
  flex: 1;
`;

export const StyledDuty = styled.div`
  background-color: #f8f8f8;
  flex: 1;
  max-height: 3rem;
  display: flex;
  flex-direction: column-reverse;
  border: 1px solid #0003;
  /* box-shadow: -.1rem .1rem .2rem #0004 inset; */
  justify-content: end;
  gap: 2px;
  padding: .2rem;
  border-radius: .2rem;
  cursor: pointer;
  user-select: none;
  transition: all 200ms;
  align-items: center;

  &.low-quantity {
    border: 1px solid #e71b1b;
    background-color: #e2cba8;
    
    &:hover {
      background-color: #e0d5c4;
    }
  }
  
  &.disabled {
    border: 1px solid #0003;
    background-color: #f8f8f8;
    opacity: .4;
    
    &:hover {
      background-color: #f8f8f8;
    }
  }

  &:hover {
    background-color: #d3d3d3;
  }
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
  flex: 1;
  text-align: center;
  font-size: .6rem;
`;

export const dutySlotStyles = css`
  height: 7px;
  width: 100%;
  max-width: 4.5rem;
  overflow: hidden;
  border-radius: .1rem;
`;

export interface StyledDutySlotProps {
  graduation: Graduation;
  gender: Gender;
}

export const graduationColorMap: Record<Graduation, string> = {
  'sub-insp': '#f0d35e',
  'insp': '#71eb8a',
  'gcm': '#313131',
};

export const genderColorMap: Record<Gender, string> = {
  'female': '#de63e2',
  'male': '#5b4af5',
  'N/A': '#727272',
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
  background-color: #adadad56;
`;