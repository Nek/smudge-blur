import styles from "./App.module.css";

import initRegl from "regl";

import vsBasicUV from "./shaders/basic-uv.vert";
import fsDisplacement from "./shaders/basic-displacement.frag";
import fsNoise from "./shaders/2d-snoise.frag";
import fsBasic from "./shaders/basic.frag";

type NoiseUniforms = {
  resolution: () => [number, number];
  scale: [number, number];
  canv: HTMLDivElement;
};

function makeDrawNoise({ scale = [3.0, 3.0] }) {
  return {
    frag: fsNoise,

    vert: vsBasicUV,

    attributes: {
      position: [-2, 0, 0, -2, 2, 2],
    },

    uniforms: {
      resolution: [1920, 1080],
      scale,
    },

    count: 3,
  };
}

type DisplacementUniforms = {
  feedbackTexture: initRegl.Texture2D;
  startingImageTexture: initRegl.Texture2D;
  displacementMap: initRegl.Texture2D;
  scale?: number;
  zoom?: [number, number];
};

function makeDrawDisplacement({
  feedbackTexture,
  startingImageTexture,
  displacementMap,
  scale = 0.001,
  zoom = [1.01, 1.01],
}: DisplacementUniforms) {
  return {
    frag: fsDisplacement,

    vert: vsBasicUV,

    attributes: {
      position: [-2, 0, 0, -2, 2, 2],
    },

    uniforms: {
      feedbackTexture,
      startingImageTexture,
      displacementMap,
      scale,
      zoom,
    },

    count: 3,
  };
}

function App() {
  let appRef: HTMLDivElement | undefined;
  let startingImage: HTMLVideoElement | undefined;

  function fullScreen() {
    if (!appRef) return;
    if (appRef.requestFullscreen) {
      appRef.requestFullscreen();
    }
  }
  
  async function startCam() {
    if (!appRef) return;
    if (startingImage) return;
    startingImage = appRef.querySelector("video") as HTMLVideoElement;

    const constraints: MediaStreamConstraints = {
      audio: false,
      video: {
        frameRate: 60,
        width: 1920,
        height: 1080,
      },
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    console.log(stream);
    startingImage.srcObject = stream;

    const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)

    startingImage.srcObject = mediaStream;
    startingImage.onloadedmetadata = () => {
      startingImage.play();
    };
  }

  async function startGL() {
    if (!appRef) return;
    const regl = initRegl(appRef.querySelector("canvas")! as HTMLCanvasElement);

    const startingImageTexture = regl.texture({
      data: startingImage,
      flipY: true,
    });

    const feedbackTexture = regl.texture({ data: startingImage, flipY: true });

    const mapFbo = regl.framebuffer({
      width: 1920,
      height: 1080,
      depth: false,
    });

    const drawDisplacement = regl({
      ...makeDrawDisplacement({
        feedbackTexture,
        startingImageTexture: () =>
          startingImageTexture.subimage(startingImage),
          displacementMap: mapFbo,
          scale: 0.001,
          zoom: [1.01, 1.01],
       }),
    });

    const drawNoise = regl({
      ...makeDrawNoise({ scale: [3.0, 3.0] }),
      framebuffer: () => mapFbo,
    });

    regl.frame(function ({ viewportWidth, viewportHeight }) {
      regl.clear({
        color: [0, 0, 0, 1],
      });

      mapFbo.resize(viewportWidth, viewportHeight)

      regl.clear({
        color: [0, 0, 0, 1],
      });

      drawNoise();

      regl.clear({
        color: [0, 0, 0, 1],
      });

      drawDisplacement();

      feedbackTexture({ copy: true });
    });
  }

  return (
    <div ref={appRef!} class={styles.App} onclick={startCam}>
      <video
        crossorigin="anonymous"
        style={{
          position: "absolute",
          "z-index": -1,
          width: "100%",
          height: "100%",
          "object-fit": "cover",
        }}
        width={1920}
        height={1080}
        controls={false}
        autoplay={true}
        muted={true}
        onplaying={startGL}
      />
      <canvas
        width={1920}
        height={1080}
        style={{ width: "100%", height: "100%", "object-fit": "cover", transform: "scale(-1, 1)", }}
        ondblclick={fullScreen}
      />
    </div>
  );
}

export default App;
