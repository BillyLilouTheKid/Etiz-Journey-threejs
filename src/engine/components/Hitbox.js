import {BoxGeometry, MeshBasicMaterial, Mesh, Vector3} from "three";
import { HitboxModeEnum } from "../../types/enums";
import GameObserver from "../observer/GameObserver";


export default class Hitbox {
    /**
     * @param {GameObject} owner
     * @param {{x:number, y:number, z:number}} size
     * @param {Vector3} position
     * @param {string} mode
     * @param {boolean} debugMode
     */
    constructor(owner, size={x:1,y:1,z:1}, position=new Vector3(0,0,0), mode=HitboxModeEnum.Passive, debugMode=false) {
        const geometry = new BoxGeometry(size.x, size.y, size.z);
        const material = new MeshBasicMaterial({ 
            color: mode === HitboxModeEnum.Active ? 0x800080 : 0x964B00,
            transparent: true,
            opacity: !debugMode ? 0 : 0.5
        });
        this.boxMesh = new Mesh(geometry, material);
        this.boxMesh.position.copy(position);
        this.owner = owner;
        this.mode = mode;
        this.owner.renderMesh?.add(this.boxMesh);
    }

    /**
     * @param {DamageData} damageData
     */
    activate(delay=0, damageData) {
        if (this.mode === HitboxModeEnum.Active) {
            setTimeout(()=>{
                GameObserver.getHitboxHandler().fire(this, damageData);
            },delay);
        }
    }

    lift() {
        if (this.mode === HitboxModeEnum.Active) return GameObserver.getHitboxHandler().returnIntersectEntity(this);
    }
}