import { Component, onMount } from 'solid-js';
import styles from './App.module.css';

import initRegl from 'regl'
//@ts-ignore
import initMouse from 'mouse-change'

import fsFeedback from "./shaders/feedback.frag"
import vsBasicUV from "./shaders/basic-uv.vert"
import fsDisplacement from "./shaders/basic-displacement.frag"
import fsNoise from "./shaders/2d-snoise.frag"
import fsBasic from "./shaders/basic.frag"

type NoiseUniforms = {
  resolution: () => [number, number],
  scale: [number, number],
}

function makeDrawNoise({scale = [1, 1]}) {
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
      scale,
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
  feedbackTexture: initRegl.Texture2D,
  startingImageTexture: initRegl.Texture2D,
  texOffset?: [number, number],
  displacementMap: initRegl.Texture2D,
  scale?: number,
  amp?: number,
}

function makeDrawDisplacement({ feedbackTexture, startingImageTexture, texOffset = [0, 0], displacementMap, scale = 2.0, amp = 0.0025 }: DisplacementUniforms) {
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
      feedbackTexture,
      startingImageTexture,
      texOffset,
      displacementMap,
      scale,
      amp,
    },

    count: 3
  })
}

import imageUrl from './assets/dear.jpg'

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

    const startingImage = await loadImage(imageUrl)

    const startingImageTexture = regl.texture({data: startingImage, flipY: true})

    const feedbackTexture = regl.texture({data: startingImage, flipY: true})

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
        feedbackTexture,
        startingImageTexture,
        displacementMap: mapFbo,
        amp: 0.001,
        scale: 1.002,
        texOffset: [0, 0]
      })
    })

    const drawNoise = regl({
      ...makeDrawNoise({scale: [0.01, 0.01]}),
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

      feedbackTexture({ copy: true })
    })
  })

  return (
    <div ref={divRef!} class={styles.App}>
    </div>
  );
}

export default App;