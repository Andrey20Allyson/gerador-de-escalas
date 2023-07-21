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
  background-color: #00000006;
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
    background-color: #f3f3f345;
    border-radius: 4px;
    width: 8px;
  }
  
  &:hover::-webkit-scrollbar-thumb {
    background-color: #ececec78;
  }

  &::-webkit-scrollbar-track {
    background-color: #d1d1d17d;
    border-radius: 4px;
    width: 8px;
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