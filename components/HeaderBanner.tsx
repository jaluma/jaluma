import React from "react";
import BackgroundParticles from "./Background";
import TextWriter, { FontConfig } from "./Typewritter";

export interface Props {
  strings?: Array<string>;
  height: string;
  width: string;
  font: FontConfig;
}

export const HeaderBanner: React.FC<Props> = ({ strings, height, width, font }) => {
  return (
    <div style={{ width: width, height: height }}>
      <BackgroundParticles />
      <TextWriter strings={strings} font={font} />
    </div>
  );
};
