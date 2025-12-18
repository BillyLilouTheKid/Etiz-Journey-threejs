import { CapsuleGeometry, MeshStandardMaterial, Mesh, AnimationMixer } from "three";
import EtizGLB from "../../../assets/models/characters/Etiz_Lego.glb";
import { Body, Box, Vec3 } from "cannon-es";
import Entity from "../base/Entity";
import PlayerController from "../../controllers/PlayerController";
import TriggerNearest from "../../../engine/components/TriggerNearest";

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
        
        super(playerMesh, capsuleBody);
        this.triggerNearest = new TriggerNearest(this.bodies.get("base"));
        this.bodies.set("trigger", this.triggerNearest.getBody());
        this.pv = 100;
        this.attackDamage = 20;
        this.controller = new PlayerController(this.bodies.get("base"), this.speed, this.jump, this.triggerNearest);

        this.loadModel(EtizGLB).then((res)=>{
            this.mixer = new AnimationMixer(this.armature);
            this.controller.setPlayerAnimations(this.mixer, this.animations);
        });
    }

    tick(delta) {
        super.tick(delta);
        this.controller.tick();
        this.triggerNearest.tick();
    }
}