import styled from "styled-components";

export const InfoCardWrapperDiv = styled.div`
  position: relative;
  display: flex;
`;

export const InfoCardDiv = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateY(calc(-100% - 0.5rem)) translateX(-50%);
  background-color: #e0e0e0;
  border-radius: 0.5rem;
  border: 1px solid #0005;
  padding: 0.25rem;
`;
