import SbireAnimationSystem from "../../engine/animations/system/SbireAnimationSystem";
import EnemyController from "./base/EnemyController";

export default class SbireController extends EnemyController {
    constructor(body, speed, target) {
        super(body, speed, target);
        this.animationSystem = null;

        this.isAttacking = false;
        this.isTakingDamaging = null;
        this.isBeingGrab = false;
        this.isLaunch = false;
        this.target = target;
    }

    setSbireAnimations(mixer, animations) {
        this.animationSystem = new SbireAnimationSystem(mixer, animations);
    }

    sbireMouvements() {
        
    }

    // this function is run every tick
    tick() {
        super.tick();
        this.sbireMouvements();
    }
}