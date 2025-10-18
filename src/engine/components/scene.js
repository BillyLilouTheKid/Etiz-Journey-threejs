import { Color, Scene } from 'three';

function createScene({color = new Color('skyblue')} = {}) {

  const scene = new Scene();
  scene.background = color;

  return scene;
}

export { createScene };