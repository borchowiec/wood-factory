import {DEBUG} from "./properties.js";

export class LogItem {
    constructor(x, y, scene) {
        this.x = x;
        this.y = y;

        this.detectionZone = new Phaser.Geom.Rectangle(
            x + 20,
            y + 20,
            10,
            10
        );

        this.graphics = scene.add.graphics();
    }

    paint() {
        this.graphics.clear();
        this.graphics.fillStyle(0xff0000, 1);
        this.graphics.setDepth(1000);
        this.graphics.fillRect(this.x, this.y, 50, 50);

        if (DEBUG) {
            this.graphics.fillStyle(0x00ff00, 1);
            this.graphics.strokeRectShape(this.detectionZone);
        }
    }

    getDetectionZone() {
        return this.detectionZone;
    }

    clear() {
        this.graphics.clear();
    }

    moveTo(x, y) {
        this.x = x;
        this.y = y;

        this.detectionZone = new Phaser.Geom.Rectangle(
            x + 20,
            y + 20,
            10,
            10
        );

        this.paint();
    }
}