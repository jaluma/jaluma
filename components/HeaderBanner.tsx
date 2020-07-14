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
      <BackgroundParticles particles={80} density={800} color={'#000000'} backgroundColor={'#E8DEDB'} />
      <TextWriter strings={strings} font={font} />
    </div>
  );
};
