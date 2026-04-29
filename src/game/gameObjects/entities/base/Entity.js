import { loadGLTF } from "../../../../engine/loaders/GLFTLoader";
import {Vector3, Box3} from "three";
import { Vec3 } from "cannon-es";
import GameObject from "../../base/GameObject";
import { EntityStatut, ObserverObjectEnum, TypeOfAttack } from "../../../../types/enums";

export default class Entity extends GameObject{

    constructor(mesh, body, objectType = ObserverObjectEnum.Entity) {
        super(mesh, body, objectType);
        this.armature = null;
        this.renderedMesh = null;

        this.animations = null;
        this.mixer = null;
        this.controller = null;
        this.statut = EntityStatut.Active;
        this.maxPv = 100;
        this.pv = this.maxPv;
        this.attackDamage = 10;
        this.speed = 20;
        this.jump = 50;
        this.triggerRadius = 125;
        this.onGround = null;
    }

    getBody(key) {
        return this.bodies.get(key);
    }

    // handle health depending of the damage and the type of the attack
    handleHealth(damage, typeAttack = TypeOfAttack.Normal) {
        this.pv -= damage;
    }

    // handle the pushforce send by the damageData
    handlePushForce(pushForce) {
        if (pushForce) {
            this.bodies.get("base").applyLocalImpulse({ x: 0, y: 10, z: -pushForce });
        }
    }


    // handle the damage receive when hitted by another entity
    onHit(damageData) {
        this.handlePushForce(damageData.pushForce); // we handle the push force of the attack
        this.handleHealth(damageData.damage, damageData.typeAttack); // we handle the damage
        // if the entity is being throwed, stunned or dead we are not playing the hit animation in order to play more specific animation
        if (![EntityStatut.Throwed, EntityStatut.Stunned, EntityStatut.Dead].includes(this.statut)) this.controller.gettingHit();
    }


    // execute every tick
    tick(delta) {
        super.tick();
        if (this.mixer) {
            this.mixer.update(delta); // update the animation mixer every tick
        }
    }

    loadModel(path) {
        return new Promise((resolve, reject) => {
            loadGLTF(path).then((gltf) => {
                const {model, animations} = gltf;
                model.position.copy(this.bodies.get("base").position);
                model.quaternion.copy(this.bodies.get("base").quaternion);
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
                    if (child.isSkinnedMesh || child.isMesh) {
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
                this.rootMesh.userData.heightOffset = size.y / 2; // roughly center height
            })
            .catch((e)=>reject);
        });
    }
}