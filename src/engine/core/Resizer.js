const setSize = (/** @type {{ clientWidth: number; clientHeight: number; }} */ container, /** @type {{ aspect: number; updateProjectionMatrix: () => void; }} */ camera, /** @type {{ setSize: (arg0: any, arg1: any) => void; setPixelRatio: (arg0: number) => void; }} */ renderer) => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
};

class Resizer {
  /**
   * @param {{ clientWidth: number; clientHeight: number; }} container
   * @param {import("three").PerspectiveCamera} camera
   * @param {import("three").WebGLRenderer} renderer
   */
  constructor(container, camera, renderer) {

    // set initial size on load
    setSize(container, camera, renderer);

    window.addEventListener("resize", () => {
      // set the size again if a resize occurs
      setSize(container, camera, renderer);
      // perform any custom actions
      this.onResize();
    });
    
    // Set the camera's aspect ratio
    camera.aspect = container.clientWidth / container.clientHeight;

    // update the camera's frustum
    camera.updateProjectionMatrix();

    // update the size of the renderer AND the canvas
    renderer.setSize(container.clientWidth, container.clientHeight);

    // set the pixel ratio (for mobile devices)
    renderer.setPixelRatio(window.devicePixelRatio);
  }

  onResize() {}
}

export { Resizer };