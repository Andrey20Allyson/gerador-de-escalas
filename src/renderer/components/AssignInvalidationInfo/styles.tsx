import styled from "styled-components";

export const AssignInvalidationInfoBox = styled.div`
  width: max-content;
  white-space: nowrap;
  font-size: 0.8rem;
  border: 1px solid #0004;
  padding: 0.15rem 0.35rem;
  border-radius: 0.15rem;
  display: flex;
  align-items: center;
  gap: 0.2rem;
  background-color: #f7f7f7;
  box-shadow: -0.15rem 0.15rem 0.15rem #0002;

  & > svg {
    color: #383004;
  }
`;

export const InvalidationAlignBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
`;
