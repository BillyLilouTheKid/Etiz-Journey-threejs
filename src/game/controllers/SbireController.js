import { LoopOnce, LoopPingPong, LoopRepeat } from "three";
import SbireAnimationSystem from "../../engine/animations/system/SbireAnimationSystem";
import EnemyController from "./base/EnemyController";
import GameObserver from "../../engine/observer/GameObserver";
import { ArmatureLayerEnum, EntityStatut, ObserverObjectEnum, StateEnum, TypeOfThrown } from "../../types/enums";

export default class SbireController extends EnemyController {
    constructor(sbireId) {
        const sbireEntity = GameObserver.getGameObject(ObserverObjectEnum.Entity, sbireId);
        super(sbireEntity.bodies.get("base"), sbireEntity.speed, sbireEntity.target);
        this.rootEntity = sbireEntity;
        this.animationSystem = null;

        this.onGround = true;
        this.isAttacking = false;
        this.isTakingDamaging = null;
        this.isBeingGrab = false;
        this.isLaunch = false;
        this.target = sbireEntity.target;
    }

    setSbireAnimations(mixer, animations) {
        this.animationSystem = new SbireAnimationSystem(mixer, animations);
    }

    sbireMouvements() {
        
    }

    stunned() {
        this.animationSystem.updateState(StateEnum.Stunned, true);
    }

    lifted() {
        this.animationSystem.lifted();
    }

    throwned() {
        this.animationSystem.playActionByName("Pushed", LoopPingPong, true, false);
    }

    gettingHit() {
        this.animationSystem.playActionByName("Getting_hit", LoopOnce, true);
    }

    receiving() {
        this.animationSystem.playActionByName("Receive");
    }

    dying() {
        this.animationSystem.playActionByName("Dead", LoopOnce, false, true, ArmatureLayerEnum.All, () => GameObserver.unsubscribe(this.rootEntity));
    }

    // this function is run every tick
    tick() {
        if (![EntityStatut.Stunned, EntityStatut.Lifted, EntityStatut.Throwed, EntityStatut.Dead].includes(this.rootEntity.statut)) {
            super.tick();
            this.sbireMouvements();
        }

    }
}