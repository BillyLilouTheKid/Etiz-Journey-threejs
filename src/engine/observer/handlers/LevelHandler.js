export default class LevelHandler {
    constructor(world) {
        this.world = world;
        this.enemiesCounter = new Set();
        this.rooms = new Set();
        this.levelIndex = 0;
    }

    moveToNextLevel() {
        const newIndex = this.levelIndex + 1;
        if (newIndex < this.rooms.length) {
            this.levelIndex = newIndex;
        }
    }

    moveSmoothCamera() {
        this.camera
    }

    decrementEnemiesCounter() {
        this.enemiesCounter[this.levelIndex]--;
        if (this.enemiesCounter[this.levelIndex] <= 0) {
            this.moveToNextLevel();
        }
    }
}