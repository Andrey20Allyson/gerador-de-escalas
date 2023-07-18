import styled from "styled-components";

export const StyledAvaliableWorkerBody = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  align-items: stretch;
  justify-content: stretch;
  flex-direction: column;
`;

export const StyledAvaliableWorkerSearchBody = styled.span`
  display: flex;
  align-items: center;
  width: fit-content;
  border-top-right-radius: .3rem;
  padding: 0 .2rem;
  background-color: #00000022;
`;

export const StyledAvaliableWorker = styled.span`
  justify-content: space-between;
  background-color: #dbdbdb;
  box-shadow: -.2rem .2rem .3rem #0003;
  border-radius: .3rem;
  align-items: center;
  width: 95%;
  padding: .3rem;
  display: flex;

  & * {
    user-select: none;
  }
`;

export const StyledAvaliableWorkersScrollable = styled.div`
  flex-direction: column;
  align-items: center;
  overflow-y: scroll;
  position: absolute;
  display: flex;
  gap: .4rem;
  height: 85%;
  width: 100%;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #007900ab;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-track {
    background-color: #0000;
  }
`;

export const StyledAvaliableWorkersSection = styled.section`
  position: relative;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  display: flex;
  flex: 1;
  border-top: 1px solid #0003;
`;