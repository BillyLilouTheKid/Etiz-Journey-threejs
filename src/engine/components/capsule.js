import { CapsuleGeometry, Mesh, MeshStandardMaterial } from 'three';

function createCapsule() {
  // create a geometry
  const geometry = new CapsuleGeometry(2, 2, 2);

  // create a default (white) Basic material
  const material = new MeshStandardMaterial({color: 'purple'});

  // create a Mesh containing the geometry and material
  const cube = new Mesh(geometry, material);

  cube.rotation.set(-0.5, -0.1, 0.8);

  return cube;
}

export { createCapsule };