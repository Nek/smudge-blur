import { Component, onMount } from 'solid-js';
import styles from './App.module.css';

import initRegl from 'regl'
//@ts-ignore
import initMouse from 'mouse-change'

import fsFeedback from "./shaders/feedback.frag?raw"
import vsBasicUV from "./shaders/basic-uv.vert?raw"
import fsDisplacement from "./shaders/displacement.frag?raw"
import fsNoise from "./shaders/2d-snoise.frag?raw"

function makeDrawNoise(regl: initRegl.Regl, resolution: [number, number]) {
  return regl({
    frag: fsNoise,

    vert: vsBasicUV,

    attributes: {
      position: [
        -2, 0,
        0, -2,
        2, 2]
    },

    uniforms: {
      resolution,
    },

    count: 3
  })
}

function makeDrawFeedback(regl: initRegl.Regl, mouse: any, pixels: initRegl.Texture2D) {
  return regl({
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

function makeDrawDisplacement(regl: initRegl.Regl, displacement: initRegl.Texture2D) {
  return regl({
    frag: fsDisplacement,

    vert: vsBasicUV,

    attributes: {
      position: [
        -2, 0,
        0, -2,
        2, 2]
    },

    uniforms: {
      texture: displacement,
      texOffset: [0, 0]
    },

    count: 3
  })
}


function App() {
  let divRef: HTMLDivElement | undefined
  onMount(() => {
    if (!divRef) return;
    const regl = initRegl()
    const mouse = initMouse()

    const pixels = regl.texture()

    // const drawFeedback = makeDrawFeedback(regl, mouse, pixels)

    // const displacement = regl.texture()

    // const drawDisplacement = makeDrawDisplacement(regl, pixels)

    const drawNoise = makeDrawNoise(regl, [1024,1024])

    regl.frame(function () {
      regl.clear({
        color: [0, 0, 0, 1]
      })

      // drawFeedback()

      // drawDisplacement()

      drawNoise()

      // pixels({
      //   copy: true
      // })
    })
  })
  return (
    <div ref={divRef!} class={styles.App}>
    </div>
  );
}

export default App;