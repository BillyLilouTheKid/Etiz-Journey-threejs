import { CapsuleGeometry, MeshStandardMaterial, Mesh, AnimationMixer } from "three";
import { Body, Box, Vec3 } from "cannon-es";
import Entity from "../base/Entity";
import SbireController from "../../controllers/SbireController";
import SbireGLB from "../../../assets/models/characters/Sbires_Lego.glb";

export default class Sbire extends Entity {
    constructor(targetBody, position = new Vec3(5,5,0)) {
        const geometry = new CapsuleGeometry(1,2);
        const material = new MeshStandardMaterial({color: 'gray'});
        const sbireMesh = new Mesh(geometry, material);
        const capsuleBody = new Body({
            mass: 5, // kg
            shape: new Box(new Vec3(1, 2, 1)),
            fixedRotation: true,
            position: position
        });
        capsuleBody.entityType = "Sbire";
        sbireMesh.position.copy(capsuleBody.position);

        super(sbireMesh, capsuleBody);
        this.pv = 50;
        this.attackDamage = 10;
        this.controller = new SbireController(this.bodies.get("base"), this.speed, targetBody);

        this.loadModel(SbireGLB).then((res)=>{
            this.mixer = new AnimationMixer(this.armature);
            this.controller.setSbireAnimations(this.mixer, this.animations);
        });
    }
    
    tick(delta) {
        super.tick(delta);
        this.controller.tick();
    }
}