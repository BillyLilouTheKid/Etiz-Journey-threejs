import { CapsuleGeometry, MeshStandardMaterial, Mesh, AnimationMixer, Vector3 } from "three";
// @ts-ignore
import EtizGLB from "../../../../assets/models/characters/Etiz_Lego.glb";
import { Body, Box, Vec3 } from "cannon-es";
import Entity from "../base/Entity";
import PlayerController from "../../../controllers/PlayerController";
import { HitboxModeEnum, ObserverObjectEnum } from "../../../../types/enums";
import GameObserver from "../../../../engine/observer/GameObserver";
import Hitbox from "../../../../engine/components/Hitbox";

export default class Etiz extends Entity {
    
    constructor(position = new Vec3(0,5,0)) {
        const geometry = new CapsuleGeometry(1,2);
        const material = new MeshStandardMaterial({color: 'blue'});
        const playerMesh = new Mesh(geometry, material);
        /**@type {CannonBody} */
        const capsuleBody = new Body({
            mass: 5, // kg
            shape: new Box(new Vec3(1, 2, 1)),
            fixedRotation: true,
            position: position,
        });
        capsuleBody.entityType = "Player";
        playerMesh.position.copy(capsuleBody.position);
        
        super(playerMesh, capsuleBody, ObserverObjectEnum.Player);
        GameObserver.subscribe(this); // we subscribe the gameObject after we set his trigger body (ugly need fixing)
        this.pv = 100;
        this.attackDamage = 20;
        this.triggerRadius = 150;

        this.controller = new PlayerController(this.getId());

        this.loadModel(EtizGLB).then(() => {
            if (!this.armature || !this.animations) return;
            this.mixer = new AnimationMixer(this.armature);
            this.controller.setPlayerAnimations(this.mixer, this.animations);
        });
    }

    /**@param {number} damage */
    // handle health depending of the damage and the type of the attack
    handleHealth(damage) {
        if (this) {
            this.pv -= damage;
            if (this.pv <= 0) {
                this.controller.dying();
            }
        }
    }

    /**
     * @param {number} [delta = 0]
     */
    tick(delta = 0) {
        super.tick(delta);
        this.controller.tick();
    }
}