import { Component, onMount } from 'solid-js';
import styles from './App.module.css';

import initRegl from 'regl'
//@ts-ignore
import initMouse from 'mouse-change'

import frag from "./shaders/feedback.frag?raw"
import vert from "./shaders/basic-uv.vert?raw"

function makeDrawFeedback(regl: initRegl.Regl, mouse: any, pixels: initRegl.Texture2D)
  {return regl({
    frag,

    vert,

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
  })}


function App() {
  let divRef: HTMLDivElement | undefined
  onMount(() => {
    if (!divRef) return;
    const regl = initRegl()
    const mouse = initMouse()

    const pixels = regl.texture()

    const drawFeedback = makeDrawFeedback(regl, mouse, pixels) 

    regl.frame(function () {
      regl.clear({
        color: [0, 0, 0, 1]
      })

      drawFeedback()

      pixels({
        copy: true
      })
    })
  })
  return (
    <div ref={divRef!} class={styles.App}>
    </div>
  );
}

export default App;