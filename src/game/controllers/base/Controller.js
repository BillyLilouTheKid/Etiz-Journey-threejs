export default class Controller {
    constructor(body, speed) {
        this.body = body;
        this.speed = speed;
        this.controls = [0,0,0]; // this array represent the x and y axis of moving in an area from -1 to 1 and on index 2 for the jump action
    }
}