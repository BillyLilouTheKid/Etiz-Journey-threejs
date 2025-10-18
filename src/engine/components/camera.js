import { PerspectiveCamera } from 'three';

function createCamera({fov = 35, aspect = 1, near = 0.1, far = 100, position = { x: 0, y: 0, z: 10 }, rotation={ x: 0, y: 0, z: 0 }} = {}) {
  const camera = new PerspectiveCamera(fov, aspect, near, far);

  // move the camera back so we can view the scene
  camera.position.set(position.x, position.y, position.z);
  camera.rotation.set(rotation.x, rotation.y, rotation.z);

  return camera;
}

export { createCamera };