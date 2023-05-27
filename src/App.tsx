import { Component, onMount } from 'solid-js';
import styles from './App.module.css';

import initRegl from 'regl'
//@ts-ignore
import initMouse from 'mouse-change'

import fsFeedback from "./shaders/feedback.frag?raw"
import vsBasicUV from "./shaders/basic-uv.vert?raw"
import fsDisplacement from "./shaders/displacement.frag?raw"
import fsNoise from "./shaders/2d-snoise.frag?raw"
import fsBasic from "./shaders/basic.frag?raw"


type NoiseUniforms = {
  resolution: () => [number, number]
}

function makeDrawNoise() {
  return ({
    frag: fsNoise,

    vert: vsBasicUV,

    attributes: {
      position: [
        -2, 0,
        0, -2,
        2, 2]
    },

    uniforms: {
      resolution: ({ viewportWidth, viewportHeight }: { viewportWidth: number, viewportHeight: number }) => [viewportWidth, viewportHeight],
    },

    count: 3
  })
}

type FeedbackUniforms = {
  mouse: any
  texture: initRegl.Texture2D
}
function makeDrawFeedback({ mouse, texture: pixels }: FeedbackUniforms) {
  return ({
    frag: fsFeedback,

    vert: vsBasicUV,

    attributes: {
      position: [
        -2, 0,
        0, -2,
        2, 2]
    },

    uniforms: {
      texture: pixels,
      mouse: ({ pixelRatio, viewportHeight }) => [
        mouse.x * pixelRatio,
        viewportHeight - mouse.y * pixelRatio
      ],
      t: ({ tick }) => 0.01 * tick
    },

    count: 3
  })
}

function makeDrawBasic({ texture }: { texture: initRegl.Texture2D }) {
  return ({
    frag: fsBasic,

    vert: vsBasicUV,

    attributes: {
      position: [
        -2, 0,
        0, -2,
        2, 2]
    },

    uniforms: {
      texture
    },

    count: 3
  })
}

type DisplacementUniforms = {
  texture: initRegl.Texture2D,
  texOffset?: [number, number],
  map: initRegl.Texture2D,
  mode?: number,
  amp?: number,
  divider?: number,
  rotRange?: number,
}

function makeDrawDisplacement({ texture, texOffset = [0, 0], map, mode = 0, amp = 0.1, divider = 0.5, rotRange = 6.283185307179586 }: DisplacementUniforms) {
  return ({
    frag: fsDisplacement,

    vert: vsBasicUV,

    attributes: {
      position: [
        -2, 0,
        0, -2,
        2, 2]
    },

    uniforms: {
      texture,
      texOffset,
      map,
      mode,
      amp,
      divider,
      rotRange,
    },

    count: 3
  })
}

import dove from './assets/dove.jpg'

async function loadImage(url:string): Promise<HTMLImageElement> {
    const image = new Image()
    image.src = url
    await image.decode()
    return image
}

function App() {
  let divRef: HTMLDivElement | undefined
  onMount(async () => {
    if (!divRef) return;
    const regl = initRegl()
    const mouse = initMouse()

    const image = await loadImage(dove)

    const pixels = regl.texture(image)

    const displacementFbo = regl.framebuffer({
      width: 1024,
      height: 1024,
      depth: false
    })

    const drawFeedback = regl(makeDrawFeedback({ mouse, texture: displacementFbo }))

    const mapFbo = regl.framebuffer({
      width: 1024,
      height: 1024,
      depth: false
    })

    const drawDisplacement = regl({
      ...makeDrawDisplacement({
        texture: pixels,
        map: mapFbo,
        mode: 3,
        amp: 0.01,
      })
    })

    const drawNoise = regl({
      ...makeDrawNoise(),
      framebuffer: () => mapFbo
    })

    regl.frame(function ({ viewportWidth, viewportHeight }) {
      mapFbo.resize(viewportWidth, viewportHeight)

      regl.clear({
        color: [0, 0, 0, 1]
      })

      drawNoise()

      regl.clear({
        color: [0, 0, 0, 1]
      })

      drawDisplacement()

      pixels({ copy: true })
    })
  })

  return (
    <div ref={divRef!} class={styles.App}>
    </div>
  );
}

export default App;