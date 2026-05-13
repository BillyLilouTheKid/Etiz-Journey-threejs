export default class LevelHandler {
    /**
     * @param {Set<WorldSystem>} world
     */
    constructor(world) {
        /**  @type {Set<WorldSystem>} world */
        this.world = world;
        /**@type {Set<number>} */
        this.enemiesCounter = new Set();
        this.rooms = new Set();
        this.levelIndex = 0;
    }

    moveToNextLevel() {
        // const newIndex = this.levelIndex + 1;
        // if (newIndex < this.rooms.length) {
        //     this.levelIndex = newIndex;
        // }
    }

    moveSmoothCamera() {
        // this.camera
    }

    decrementEnemiesCounter() {
        // this.enemiesCounter[this.levelIndex]--;
        // if (this.enemiesCounter[this.levelIndex] <= 0) {
        //     this.moveToNextLevel();
        // }
    }

    isDebugMode() {
        const [world] = this.world;
        return world.getOnDebugMode();
    }
}