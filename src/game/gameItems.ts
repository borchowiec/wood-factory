import {DEBUG, DEBUG_DEPTH, ITEM_DEPTH, TILE_SIZE} from "./properties.js";
import * as Phaser from "phaser";
import * as Phaser from "phaser";

const DETECTOR_SIZE = TILE_SIZE / 10;

export abstract class GameItem {
    abstract getPrice(): number;
    abstract paint(): void;
    abstract getDetectionZones(): Phaser.Geom.Rectangle[];
    abstract clear(): void;
    abstract moveTo(x: number, y: number): void;
    abstract getX(): number;
    abstract getY(): number;
    abstract areDetectionZonesOverlapping(gameItem: GameItem): boolean;
}

abstract class BasicItem extends GameItem {
    x: number;
    y: number;
    width: number;
    height: number;
    verticalDetectionZone: Phaser.Geom.Rectangle;
    horizontalDetectionZone: Phaser.Geom.Rectangle;
    debugGraphics: Phaser.GameObjects.Graphics;
    image: Phaser.GameObjects.Image;
    price: number;

    protected constructor(x, y, imageName, scene: Phaser.Scene, price) {
        super();

        this.image = scene.add.image(x, y, imageName);
        this.image.setOrigin(0, 0);
        this.image.setDepth(ITEM_DEPTH);

        this.price = price;

        this.width = this.image.width;
        this.height = this.image.height;
        this.x = x;
        this.y = y;
        this.verticalDetectionZone = new Phaser.Geom.Rectangle(
            x + (this.width - DETECTOR_SIZE) / 2,
            y,
            DETECTOR_SIZE,
            this.height
        );
        this.horizontalDetectionZone = new Phaser.Geom.Rectangle(
            x,
            y + (this.height - DETECTOR_SIZE) / 2,
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

        this.image.x = x;
        this.image.y = y;

        this.debugGraphics.x = this.x;
        this.debugGraphics.y = this.y;
    }

    paint() {
        if (DEBUG) {
            this.debugGraphics.clear();
            this.debugGraphics.x = this.x;
            this.debugGraphics.y = this.y;
            this.debugGraphics.setDepth(DEBUG_DEPTH);
            this.debugGraphics.lineStyle(1, 0xffff00, 1);
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

    clear() {
        this.debugGraphics.clear();
        this.image.destroy();
    }

    getX(): number {
        return this.x;
    }

    getY(): number {
        return this.y;
    }

    areDetectionZonesOverlapping(gameItem: GameItem): boolean {
        for (let i = 0; i < this.getDetectionZones().length; i++) {
            const thisDetectionZone = this.getDetectionZones()[i];
            for (let j = 0; j < gameItem.getDetectionZones().length; j++) {
                const gameItemDetectionZone = gameItem.getDetectionZones()[j];
                if (Phaser.Geom.Intersects.RectangleToRectangle(thisDetectionZone, gameItemDetectionZone)) {
                    return true;
                }
            }
        }
        return false;
    }

    getPrice(): number {
        return this.price;
    }
}

export class LogItem extends BasicItem {
    constructor(x, y, scene: Phaser.Scene) {
        super(x, y, "log", scene, 10);
    }
}

export class PlankItem extends BasicItem {
    constructor(x, y, scene: Phaser.Scene) {
        super(x, y, "plank", scene, 25);
    }
}


export class BeamItem extends BasicItem {
    constructor(x, y, scene: Phaser.Scene) {
        super(x, y, "beam", scene, 25);
    }
}

export class NailItem extends BasicItem {
    constructor(x, y, scene: Phaser.Scene) {
        super(x, y, "nail", scene, 7);
    }
}