import { TextAlignProperty } from "csstype";
import React from "react";
import Typist from 'react-typist';

export interface Props {
  strings: Array<string>;
  font: FontConfig
}

export interface FontConfig {
  size?: number;
  family?: string;
  color?: string;
  weight?: number;
  align?: TextAlignProperty;
}

export const TextWriter: React.FC<Props> = ({ strings, font }) => {
  return (
    <Typist>
      { strings.map(text =>
        <span
          style={{
            fontSize: font.size ? `${font.size }px` : undefined,
            lineHeight: 1,
            fontFamily: font.family,
            color: font.color,
            fontWeight: font.weight,
            textAlign: font.align
          }}
        >
          {text}
        </span>
      )}
    </Typist>
  );
};

export default TextWriter;
