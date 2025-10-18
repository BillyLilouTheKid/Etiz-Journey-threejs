import { DirectionalLight } from 'three';

function createLights({intensity = 8, position = {x: 10 ,y: 10, z: 10}} = {}) {
    const light = new DirectionalLight('white', intensity);

    // move the light right, up, and towards us
    light.position.set(position.x, position.y, position.z);

    return light;
}

export { createLights };