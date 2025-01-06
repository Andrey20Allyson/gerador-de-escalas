import { css } from "styled-components";

export namespace BackgroundColor {
  function create(normal: string, darkMode: string) {
    return css`
      background-color: ${normal};

      .dark & {
        background-color: ${darkMode};
      }
    `;
  }

  export const bg0 = create("#f5f5f5", "#272727");
  export const bg1 = create("#e9e9e9", "#272727");
  export const bg2 = create("#e4e4e4", "#272727");
  export const bg3 = create("#d4d4d4", "#272727");
}
