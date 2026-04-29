import { ObserverObjectEnum } from "../../../../types/enums";
import GameObject from "../../base/GameObject";

export default class Item extends GameObject {
    constructor(mesh, body) {
        super(mesh, body, ObserverObjectEnum.Item);
    }

    tick() {
        super.tick();
        this.bodies.get("base").quaternion.y += 0.1;
    }
}