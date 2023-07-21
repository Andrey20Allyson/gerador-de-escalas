import styled from "styled-components";

export const StyledDayViewModal = styled.span`
  overflow: hidden;
  box-sizing: content-box;
  flex-direction: column;
  display: flex;
  width: 80%;
  height: 80%;
  background-color: #d1d1d1;
  border-radius: .5rem;
  box-shadow: -.4rem .4rem .6rem #0005;
`;

export const StyledModalHeader = styled.div`
  display: flex;
  height: 30px;
  padding: 0 .4rem;
  justify-content: space-between;
  align-items: center;
  background-color: #bbbbbb;
  border-bottom: 1px solid #6d6d6d5a;

  &>svg {
    cursor: pointer;
  }
`;

export const StyledDayViewNavigation = styled.nav`
  width: 20%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  align-self: center;

  & * {
    user-select: none;
  }

  &>svg {
    cursor: pointer;
    transition: fill 200ms, transform 200ms;
  }

  &>svg:hover {
    fill: #0008;
  }

  &>svg:active {
    transform: scale(.9);
  }
`;

export const StyledModalTitle = styled.h1`
  gap: .4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  font-size: 1rem;
  flex: 1;
`;

export const StyledModalBody = styled.div`
  flex-direction: column;
  padding: .3rem;
  display: flex;
  flex: 1;
`;

export const StyledDutyViewBody = styled.section`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr 1.2fr;
  justify-content: stretch;
  align-items: stretch;
  gap: .4rem;
  flex: 1;
  flex-direction: column;
`;

export const StyledDutyViewNavigation = styled.nav`
  display: flex;
  gap: .2rem;
  border-bottom: 1px solid #0003;
`;

export const StyledModalTitle2 = styled.h2`
  width: 100%;
  font-size: .9rem;
`;

export const StyledDutyViewSlotSection = styled.section`
  flex-direction: column;
  align-items: stretch;
  display: flex;
  gap: .3rem;
`;

export const StyledWorkerViewBody = styled.span`
  box-shadow: -.2rem .2rem .2rem #0002;
  justify-content: space-between;
  background-color: #e2e2e2;
  border-radius: .3rem;
  align-items: center;
  padding: .3rem;
  display: flex;

  &, & * {
    user-select: none;
  }

  &>.info {
    height: 100%;
    display: flex;
    gap: .3rem;
    align-items: center;
  }
`;

export interface StyledDutyViewNavButtonProps {
  selected?: boolean;
}

export const StyledDutyViewNavButton = styled.button<StyledDutyViewNavButtonProps>`
  cursor: pointer;
  outline: none;
  border: none;
  border-top-right-radius: .4rem;
  background-color: ${({ selected }) => selected ? '#9e9e9e' : '#e0e0e0'};
  transition: background-color 200ms;

  &:hover {
    background-color: ${({ selected }) => selected ? '#9e9e9e' : '#b3b3b3'};
  }
`;

export const StyledEmpityDutyMessage = styled.h3`
  color: #00000067;
  text-align: center;
`;