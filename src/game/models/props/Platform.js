import { BoxGeometry, MeshStandardMaterial, Mesh } from "three";
import {Body, Box, Vec3 } from "cannon-es";
import Model from "../base/Model";

class Platform extends Model {
    constructor() {
        // Create a static plane for the ground
        const groundBody = new Body({
            type: Body.STATIC, // can also be achieved by setting the mass to 0
            shape: new Box(new Vec3(100, 0.1, 100)),
        });
        groundBody.isGround = true;
        const geometry = new BoxGeometry(100, 0.1, 100);
        const material = new MeshStandardMaterial({color: 'cyan'});
        const groundMesh = new Mesh(geometry, material);
        super(groundMesh, groundBody);

    }
}

export default Platform;