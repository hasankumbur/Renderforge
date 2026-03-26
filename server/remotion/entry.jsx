import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { RenderForgeComposition } from './RenderForgeComposition.jsx';

const RemotionRoot = () => {
  return (
    <Composition
      id="RenderForgeComposition"
      component={RenderForgeComposition}
      durationInFrames={300}
      fps={30}
      width={1080}
      height={1080}
      defaultProps={{
        schema: {
          background: '#ffffff',
          layers: [],
          width: 1080,
          height: 1080,
        },
        fps: 30,
        durationInFrames: 300,
        width: 1080,
        height: 1080,
      }}
      calculateMetadata={({ props }) => {
        return {
          durationInFrames: Number(props?.durationInFrames || 300),
          fps: Number(props?.fps || 30),
          width: Number(props?.width || 1080),
          height: Number(props?.height || 1080),
        };
      }}
    />
  );
};

registerRoot(RemotionRoot);
