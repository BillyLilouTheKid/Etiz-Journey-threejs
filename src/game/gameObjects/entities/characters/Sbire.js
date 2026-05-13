import { CapsuleGeometry, MeshStandardMaterial, Mesh, AnimationMixer, Vector3 } from "three";
import { Body, Box, Vec3 } from "cannon-es";
import Entity from "../base/Entity";
import SbireController from "../../../controllers/SbireController";
// @ts-ignore
import SbireGLB from "../../../../assets/models/characters/Sbires_Lego.glb";
import { EntityStatut, HitboxModeEnum, ObserverObjectEnum, TypeOfAttack } from "../../../../types/enums";
import GameObserver from "../../../../engine/observer/GameObserver";
import Hitbox from "../../../../engine/components/Hitbox";

export default class Sbire extends Entity {
    /**
     * @param {import("./Etiz").default} targetBody
     */
    constructor(targetBody, position = new Vec3(5,5,0)) {
        const geometry = new CapsuleGeometry(1,2);
        const material = new MeshStandardMaterial({color: 'gray'});
        const sbireMesh = new Mesh(geometry, material);
        /**@type {CannonBody} */
        const capsuleBody = new Body({
            mass: 5, // kg
            shape: new Box(new Vec3(1, 2, 1)),
            fixedRotation: true,
            position: position
        });
        capsuleBody.entityType = "Sbire";
        sbireMesh.position.copy(capsuleBody.position);

        super(sbireMesh, capsuleBody);
        this.maxPv = 50;
        this.pv = this.maxPv;
        this.attackDamage = 10;
        this.target = targetBody;
        this.controller = new SbireController(this.getId());

        this.loadModel(SbireGLB).then(()=>{
            if (!this.armature || !this.animations) return;
            this.mixer = new AnimationMixer(this.armature);
            this.controller.setSbireAnimations(this.mixer, this.animations);
        });

        // when the body is on the air we update the isGround status
        this.body.addEventListener("collide", ( /** @type {CollideEvent}*/event) => {
            const entity = GameObserver.getGameObject(ObserverObjectEnum.Entity, event.body.gameObjectID);
            if (this.statut === EntityStatut.Throwed && event.body.isGround) {
                this.controller.dying();
            }
            if (entity && entity.statut === EntityStatut.Throwed) {
                this.handleHealth(30, TypeOfAttack.ThrowedEntity);
            }
        });
    }

    /**
     * @param {number} damage
     * @param {string} typeAttack
     */
    // handle health depending of the damage and the type of the attack
    handleHealth(damage, typeAttack = TypeOfAttack.Normal) {
        if (this) {
            this.pv -= damage;
            if (this.pv <= this.maxPv * 0.2) {
                if (this.pv > 0) {
                    this.statut = EntityStatut.Stunned;
                    this.controller.stunned();
                }
                else {
                    switch (typeAttack) {
                        case (TypeOfAttack.Charged):
                            this.statut = EntityStatut.Throwed;
                            this.controller.throwned();
                            break;
                        case (TypeOfAttack.ThrowedEntity):
                            this.controller.receiving();
                            break;
                        default:
                            this.statut = EntityStatut.Dead;
                            this.controller.dying();
                            break;
                    }
                }
            }
        }
    }

    /**@param {number} pushForce */
    // handle the pushforce send by the damageData
    handlePushForce(pushForce) {
        if (pushForce) {
            const isStunnedMultiplier = this.statut === EntityStatut.Stunned ? 3 : 1;
            this.body.applyLocalImpulse(new Vec3( 0,10, -pushForce * isStunnedMultiplier ));
        }
    }

    /**@param {DamageData} damageData */
    // handle the damage receive when hitted by another entity
    onHit(damageData) {
        this.controller.lockToTarget(); // we lock the player rotation to the target
        super.onHit(damageData); // we run the parent onHit function
    }
    
    /**
     * @param {number} [delta = 0]
     */
    tick(delta = 0) {
        super.tick(delta);
        this.controller.tick();
    }
}