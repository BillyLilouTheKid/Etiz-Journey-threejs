import SharedAnimationSystem from "./base/SharedAnimationSystem";

export default class SbireAnimationSystem extends SharedAnimationSystem {
    constructor(mixer, animations) {
        super("Sbire", mixer, animations);
    }
}