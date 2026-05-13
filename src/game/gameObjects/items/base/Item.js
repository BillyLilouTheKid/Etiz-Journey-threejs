import { ObserverObjectEnum } from "../../../../types/enums";
import GameObject from "../../base/GameObject";

export default class Item extends GameObject {
    /**
     * @param {any} mesh
     * @param {CannonBody} body
     */
    constructor(mesh, body) {
        super(mesh, body, ObserverObjectEnum.Item);
    }

    tick() {
        super.tick();
        this.body.quaternion.y += 0.1;
    }
}