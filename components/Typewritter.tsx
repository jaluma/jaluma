import React from "react";
import Typewriter from "typewriter-effect";

export interface Props {
  strings: Array<string>;
  font: FontConfig
}

export interface FontConfig {
  size?: number;
  family?: string;
  color?: string;
  weight?: string;
}

export const TextWriter: React.FC<Props> = ({ strings, font }) => {
  return (
    <Typewriter
      options={{
        strings: strings,
        autoStart: true,
        loop: true,
      }}
      style={{
        fontSize: font.size ? `${font.size }px` : undefined,
        lineHeight: 1,
        fontFamily: font.family,
        color: font.color,
        fontWeight: font.weight,
      }}
    />
  );
};

export default TextWriter;
