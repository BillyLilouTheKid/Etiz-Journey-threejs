import { loadGLTF } from "../../../../engine/loaders/GLFTLoader";
import {Vector3, Box3} from "three";
import GameObject from "../../base/GameObject";
import { EntityStatut, HitboxModeEnum, ObserverObjectEnum, TypeOfAttack } from "../../../../types/enums";
import { Vec3 } from "cannon-es";
import GameObserver from "../../../../engine/observer/GameObserver";
import Hitbox from "../../../../engine/components/Hitbox";

export default class Entity extends GameObject{

    /**
     * @param {Mesh} mesh
     * @param {CannonBody} body
     * @param {string} objectType
     */
    constructor(mesh, body, objectType = ObserverObjectEnum.Entity) {
        super(mesh, body, objectType);
        this.armature = null;
        /**
         * @type {SbireController | PlayerController | null}
         */
        this.controller = null;
        /** @type {EntityStatutType} */
        this.statut = EntityStatut.Active;
        /**@type {number} */
        this.maxPv = 100;
        /**@type {number} */
        this.pv = this.maxPv;
        /**@type {number} */
        this.attackDamage = 10;
        /**@type {number} */
        this.speed = 20;
        /**@type {number} */
        this.jump = 50;
        /**@type {number} */
        this.triggerRadius = 125;
        /**@type {any} */
        this.onGround = null;
    }

    getBody() {
        return this.body;
    }

    // handle health depending of the damage and the type of the attack
    /**
     * @param {number} damage
     * @param {string} _typeAttack
     */
    handleHealth(damage, _typeAttack = TypeOfAttack.Normal) {
        this.pv -= damage;
    }

    // handle the pushforce send by the damageData
    /**
     * @param {number} pushForce
     */
    handlePushForce(pushForce) {
        if (pushForce) {
            this.body.applyLocalImpulse(new Vec3(0, 10, -pushForce ));
        }
    }


    // handle the damage receive when hitted by another entity
    /**
     * @param {DamageData} damageData
     */
    onHit(damageData) {
        // if the entity is being throwed, stunned or dead we are not playing the hit animation in order to play more specific animation
        /** @type {EntityStatutType[]} */
        const blockedStatus = [
            EntityStatut.Throwed,
            EntityStatut.Stunned,
            EntityStatut.Dead
        ];
        console.log(!blockedStatus.includes(this.statut), this.controller);
        if (!blockedStatus.includes(this.statut) && this.controller) this.controller.gettingHit();
        this.handlePushForce(damageData.pushForce ?? 0); // we handle the push force of the attack
        this.handleHealth(damageData.damage, damageData.typeAttack); // we handle the damage
    }


    /**
     * @param {number} [delta = 0]
     */
    // execute every tick
    tick(delta = 0) {
        super.tick();
        if (this.mixer) {
            this.mixer.update(delta); // update the animation mixer every tick
        }
    }

    /**
     * @param {string} path
     */
    loadModel(path) {
        return new Promise((resolve, reject) => {
            loadGLTF(path).then((gltf) => {
                const {model, animations} = gltf;
                model.position.copy(this.body.position);
                model.quaternion.copy(this.body.quaternion);
                const multiply = 4;
                model.scale.copy(new Vector3(this.rootMesh.scale.x * multiply,this.rootMesh.scale.y * multiply,this.rootMesh.scale.z * multiply));

                // replace the placeholder with the real mesh
                if (this.rootMesh.parent) {
                    this.rootMesh.parent.add(model);
                    this.rootMesh.parent.remove(this.rootMesh);
                }
                this.rootMesh = model;
                this.animations = animations;
                // search for the armature bone inside the model skeleton
                model.traverse((child) => {
                    if (child.name.toLowerCase().includes("armature")) {
                        this.armature = child;
                    }
                    if ("isSkinnedMesh" in child || "isMesh" in child) {
                        this.renderMesh = child;
                    }
                });

                // fallback if no armature where found
                if (!this.armature) {
                    console.warn("Error: No armature found inside the model");
                    this.armature = model;
                }
                resolve(true);
                
                // we set the offsetHeight
                const box = new Box3().setFromObject(model);
                const size = new Vector3();
                box.getSize(size);

                const debugModeActive = GameObserver.getLevelHandler().isDebugMode();
                // we set the Hitbox
                this.rootMesh.userData.heightOffset = size.y / 2; // roughly center height
                /**@type {Hitbox} */
                this.passiveHitbox = new Hitbox(this, {x:0.5,y:2,z:0.5}, new Vector3(0,0,0), HitboxModeEnum.Passive, debugModeActive);
                /**@type {Hitbox} */
                this.activeHitbox = new Hitbox(this, {x:0.5,y:0.5,z:0.5}, new Vector3(0,0.5,0.4), HitboxModeEnum.Active, debugModeActive);
            })
            .catch(reject);
        });
    }
}