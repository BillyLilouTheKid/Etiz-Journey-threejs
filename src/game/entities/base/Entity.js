import { loadGLTF } from "../../../engine/loaders/GLFTLoader";
import {Vector3} from "three";

export default class Entity {

    constructor(mesh, body) {
        this.mesh = mesh;
        this.armature = null;
        this.body = body;
        this.animations = null;
        this.mixer = null;
        this.pv = 100;
        this.attackDamage = 10;
        this.speed = 20;
        this.jump = 50;
        this.controller = null;
    }

    tick(delta) {
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
        if (this.mixer) {
            this.mixer.update(delta);
        }
    }

    loadModel(path) {
        return new Promise((resolve, reject) => {
            loadGLTF(path).then((gltf) => {
                const {model, animations} = gltf;
                model.position.copy(this.body.position);
                model.quaternion.copy(this.body.quaternion);
                const multiply = 4;
                model.scale.copy(new Vector3(this.mesh.scale.x * multiply,this.mesh.scale.y * multiply,this.mesh.scale.z * multiply));

                // Remplacer le placeholder par le vrai mesh
                if (this.mesh.parent) {
                    this.mesh.parent.add(model);
                    this.mesh.parent.remove(this.mesh);
                }
                this.mesh = model;
                this.animations = animations;
                // 🔍 Recherche automatique du squelette animé
                model.traverse((child) => {
                    if (child.name.toLowerCase().includes("armature")) {
                        this.armature = child;
                    }
                });

                // fallback si rien trouvé
                if (!this.armature) {
                    console.warn("⚠️ Aucun Armature trouvé, fallback sur le model racine");
                    this.armature = model;
                }
                resolve(true);
            })
            .catch((e)=>reject);
        });
    }
}