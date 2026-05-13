import { Color, Scene } from 'three';

/**
 * Create a Scene.
 *
 * @param {Object} [options={}]
 * @param {Color} [options.color=new Color('skyblue')]
 * @returns {Scene}
 */
function createScene({color = new Color('skyblue')} = {}) {

  const scene = new Scene();
  scene.background = color;

  return scene;
}

export { createScene };