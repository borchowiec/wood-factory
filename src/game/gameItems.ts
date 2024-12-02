import {DEBUG, DEBUG_DEPTH, ITEM_DEPTH, TILE_SIZE} from "./properties.js";
import * as Phaser from "phaser";

const DETECTOR_SIZE = TILE_SIZE / 10;

export abstract class GameItem {
    abstract paint(): void;
    abstract getDetectionZones(): Phaser.Geom.Rectangle[];
    abstract clear(): void;
    abstract moveTo(x: number, y: number): void;
}

abstract class BasicItem extends GameItem {
    x: number;
    y: number;
    width: number;
    height: number;
    verticalDetectionZone: Phaser.Geom.Rectangle;
    horizontalDetectionZone: Phaser.Geom.Rectangle;
    debugGraphics: Phaser.GameObjects.Graphics;

    protected constructor(x, y, width, height, scene: Phaser.Scene) {
        super();
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.verticalDetectionZone = new Phaser.Geom.Rectangle(
            x + (width - DETECTOR_SIZE) / 2,
            y,
            DETECTOR_SIZE,
            this.height
        );
        this.horizontalDetectionZone = new Phaser.Geom.Rectangle(
            x,
            y + (height - DETECTOR_SIZE) / 2,
            this.width,
            DETECTOR_SIZE
        );
        this.debugGraphics = scene.add.graphics();
    }

    getDetectionZones(): Phaser.Geom.Rectangle[] {
        return [this.verticalDetectionZone, this.horizontalDetectionZone];
    }


    moveTo(x: number, y: number) {
        this.x = x;
        this.y = y;

        this.verticalDetectionZone.x = x + (this.width - DETECTOR_SIZE) / 2;
        this.verticalDetectionZone.y = y;
        this.verticalDetectionZone.width = DETECTOR_SIZE;
        this.verticalDetectionZone.height = this.height;

        this.horizontalDetectionZone.x = x;
        this.horizontalDetectionZone.y = y + (this.height - DETECTOR_SIZE) / 2;
        this.horizontalDetectionZone.width = this.width;
        this.horizontalDetectionZone.height = DETECTOR_SIZE;
    }

    paint() {
        if (DEBUG) {
            this.debugGraphics.clear();
            this.debugGraphics.x = this.x;
            this.debugGraphics.y = this.y;
            this.debugGraphics.setDepth(DEBUG_DEPTH);
            this.debugGraphics.fillStyle(0x00ff00, 1);
            this.getDetectionZones().forEach(detectionZone => {
                this.debugGraphics.strokeRect(
                    detectionZone.x - this.x,
                    detectionZone.y - this.y,
                    detectionZone.width,
                    detectionZone.height
                );
            });
        }
    }
}

export class LogItem extends BasicItem {
    graphics: Phaser.GameObjects.Graphics;

    constructor(x, y, scene: Phaser.Scene) {
        super(x, y, 50, 50, scene);
        this.graphics = scene.add.graphics();
    }

    paint() {
        super.paint();

        this.graphics.clear();
        this.graphics.x = this.x;
        this.graphics.y = this.y;

        this.graphics.setDepth(ITEM_DEPTH);
        this.graphics.fillStyle(0xff0000, 1);
        this.graphics.fillRect(0, 0, 50, 50);
    }

    clear() {
        this.graphics.clear();
        this.debugGraphics.clear();
    }

    moveTo(x: number, y: number) {
        super.moveTo(x, y);

        this.graphics.x = x;
        this.graphics.y = y;

        this.debugGraphics.x = this.x;
        this.debugGraphics.y = this.y;
    }
}