import { PerspectiveCamera } from 'three';

/**
 * Create a perspective camera.
 *
 * @param {Object} [options={}]
 * @param {number} [options.fov=35]
 * @param {number} [options.aspect=1]
 * @param {number} [options.near=0.1]
 * @param {number} [options.far=100]
 * @param {{x:number, y:number, z:number}} [options.position={ x:0, y:0, z:10 }]
 * @param {{x:number, y:number, z:number}} [options.rotation={ x:0, y:0, z:0 }]
 * @returns {PerspectiveCamera}
 */
function createCamera({fov = 35, aspect = 1, near = 0.1, far = 100, position = { x: 0, y: 0, z: 10 }, rotation={ x: 0, y: 0, z: 0 }} = {}) {
  const camera = new PerspectiveCamera(fov, aspect, near, far);

  // move the camera back so we can view the scene
  camera.position.set(position.x, position.y, position.z);
  camera.rotation.set(rotation.x, rotation.y, rotation.z);

  return camera;
}

export { createCamera };