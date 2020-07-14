import React from "react";
import Particles from "react-particles-js";
import Safe from "react-safe";

export interface Props {
  particles?: number;
  density?: number;
  color?: string;
  backgroundColor?: string;
}

const BackgroundParticles: React.FC<Props> = ({ particles, density, color, backgroundColor }) => {
  return (
    <div>
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
      <Safe.script src="https://cdn.rawgit.com/progers/pathseg/master/pathseg.js"></Safe.script>
    </div>
  );
};

export default BackgroundParticles;
