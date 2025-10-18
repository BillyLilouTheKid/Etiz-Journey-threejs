import TestMap from "./game/scenes/TestMap";


// create the main function
function main() {
  // Get a reference to the container element
  const container = document.querySelector('#scene-container');

  const scene = new TestMap(container);

  // 2. Render the scene
  scene.render();

  scene.start();
}

// call main to start the app
main();