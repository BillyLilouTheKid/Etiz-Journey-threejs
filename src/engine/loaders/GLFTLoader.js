import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

/**
 * @param {string} path
 * @returns {Promise<{
 *   model: import("three").Group,
 *   animations: import("three").AnimationClip[]
 * }>}
 */
export function loadGLTF(path) {
  return new Promise((resolve, reject) => {
    loader.load(path, (gltf) => {
      const model = gltf.scene;
      const animations = gltf.animations;
      resolve({model, animations});
    }, undefined, reject);
  });
}