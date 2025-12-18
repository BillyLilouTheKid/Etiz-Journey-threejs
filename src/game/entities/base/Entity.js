import { loadGLTF } from "../../../engine/loaders/GLFTLoader";
import {Vector3, Box3} from "three";

export default class Entity {

    constructor(mesh, body) {
        this.mesh = mesh;
        this.mesh.userData.heightOffset = 0;
        this.armature = null;

        this.bodies = new Map();
        this.bodies.set("base", body);

        this.animations = null;
        this.mixer = null;
        this.pv = 100;
        this.attackDamage = 10;
        this.speed = 20;
        this.jump = 50;
        this.controller = null;
    }

    getBody(key) {
        return this.bodies.get(key);
    }

    // execute every tick
    tick(delta) {
        this.mesh.position.copy(this.bodies.get("base").position); // make the mesh copy the base body position (not the trigger box)
        this.mesh.position.y -= this.mesh.userData.heightOffset; // set the Y position of the mesh to be at the center of the body entity
        this.mesh.quaternion.copy(this.bodies.get("base").quaternion); // make the mesh copy the base body rotation (not the trigger box)
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
                model.scale.copy(new Vector3(this.mesh.scale.x * multiply,this.mesh.scale.y * multiply,this.mesh.scale.z * multiply));

                // replace the placeholder with the real mesh
                if (this.mesh.parent) {
                    this.mesh.parent.add(model);
                    this.mesh.parent.remove(this.mesh);
                }
                this.mesh = model;
                this.animations = animations;
                // search for the armature bone inside the model skeleton
                model.traverse((child) => {
                    if (child.name.toLowerCase().includes("armature")) {
                        this.armature = child;
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
                this.mesh.userData.heightOffset = size.y / 2; // roughly center height
            })
            .catch((e)=>reject);
        });
    }
}