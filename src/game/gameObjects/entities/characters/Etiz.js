import { CapsuleGeometry, MeshStandardMaterial, Mesh, AnimationMixer, Vector3 } from "three";
import EtizGLB from "../../../../assets/models/characters/Etiz_Lego.glb";
import { Body, Box, Vec3 } from "cannon-es";
import Entity from "../base/Entity";
import PlayerController from "../../../controllers/PlayerController";
import Hitbox from "../../../../engine/components/Hitbox";
import { HitboxModeEnum, ObserverObjectEnum } from "../../../../types/enums";
import GameObserver from "../../../../engine/observer/GameObserver";

export default class Etiz extends Entity {
    
    constructor(position = new Vec3(0,5,0)) {
        const geometry = new CapsuleGeometry(1,2);
        const material = new MeshStandardMaterial({color: 'blue'});
        const playerMesh = new Mesh(geometry, material);
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

        this.loadModel(EtizGLB).then((res)=>{
            this.mixer = new AnimationMixer(this.armature);
            this.controller.setPlayerAnimations(this.mixer, this.animations);
            this.passiveHitbox = new Hitbox(this, {x:0.5,y:2,z:0.5}, new Vector3(0,0,0), HitboxModeEnum.Passive, true);
            this.activeHitbox = new Hitbox(this, {x:0.5,y:0.5,z:0.5}, new Vector3(0,0.5,0.4), HitboxModeEnum.Active, true);
        });
    }

    // handle health depending of the damage and the type of the attack
    handleHealth(damage) {
        if (this) {
            this.pv -= damage;
            if (this.pv <= 0) {
                this.controller.dying();
                setTimeout(()=>delete this, 100);
            }
        }
    }

    tick(delta) {
        super.tick(delta);
        this.controller.tick();
    }
}