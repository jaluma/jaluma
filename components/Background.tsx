import Particles from "react-particles-js";

import React from "react";

export interface Props {
  particles?: number;
  density?: number;
  color?: string;
  backgroundColor?: string;
}

const BackgroundParticles: React.FC<Props> = ({ particles, density, color, backgroundColor }) => {
  return (
    <Particles
      params={{
        particles: {
          number: {
            value: particles,
            density: {
              value_area: density
            }
          },
          size: {
            value: 5,
          },
          color: {
            value: color
          }
        },
        interactivity: {
          events: {
            onhover: {
              enable: true,
              mode: "repulse",
            },
          },
        },
        background: {
          color: backgroundColor
        }       
      }}
    />
  );
};

export default BackgroundParticles;
