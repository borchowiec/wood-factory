import {DEBUG, DEBUG_DEPTH, ITEM_DEPTH, TILE_SIZE} from "./properties.js";
import * as Phaser from "phaser";
import * as Phaser from "phaser";
import * as Phaser from "phaser";
import * as Phaser from "phaser";
import * as Phaser from "phaser";
import * as Phaser from "phaser";
import * as Phaser from "phaser";
import * as Phaser from "phaser";
import * as Phaser from "phaser";
import * as Phaser from "phaser";
import * as Phaser from "phaser";
import * as Phaser from "phaser";
import * as Phaser from "phaser";
import * as Phaser from "phaser";
import {i} from "vite/dist/node/types.d-aGj9QkWt";
import * as Phaser from "phaser";

const DETECTOR_SIZE = TILE_SIZE / 10;

export class GameItemData {
    readonly id: number;
    readonly imageName: string;
    readonly price: number;

    constructor(id: number, imageName: string, price: number) {
        this.id = id;
        this.imageName = imageName;
        this.price = price;
    }
}

export const LOG_ID = 1;
export const PLANK_ID = 2;
export const BEAM_ID = 3;
export const NAIL_ID = 4;
export const SHEET_OF_PAPER_ID = 5;
export const CLOTH_ID = 6;
export const SAIL_ID = 7;
export const CHAIR_ID = 8;
export const TABLE_ID = 9;
export const SCULPTURE_ID = 10;
export const BOAT_ID = 11;
export const SIMPLE_SAILBOAT_ID = 12;
export const BIG_SAILBOAT_ID = 13;
export const SHIP_ID = 14;

export const gameItemsData = [
    new GameItemData(LOG_ID, "log", 10),
    new GameItemData(PLANK_ID, "plank", 25),
    new GameItemData(BEAM_ID, "beam", 25),
    new GameItemData(NAIL_ID, "nail", 7),
    new GameItemData(SHEET_OF_PAPER_ID, "paper", 10),
    new GameItemData(CLOTH_ID, "fabric", 50),
    new GameItemData(SAIL_ID, "sail", 100),
    new GameItemData(CHAIR_ID, "chair", 75),
    new GameItemData(TABLE_ID, "table", 150),
    new GameItemData(SCULPTURE_ID, "sculpture", 200),
    new GameItemData(BOAT_ID, "boat", 400),
    new GameItemData(SIMPLE_SAILBOAT_ID, "simple-sailboat", 700),
    new GameItemData(BIG_SAILBOAT_ID, "big-sailboat", 1200),
    new GameItemData(SHIP_ID, "ship", 2500),
]

export function getGameItemDataById(id: number): GameItemData {
    return gameItemsData.find((data) => data.id === id);
}

export function getNextGameItemData(id: number): GameItemData {
    const index = gameItemsData.findIndex((data) => data.id === id);
    return gameItemsData[(index + 1) % gameItemsData.length];
}

export abstract class GameItem {
    abstract getPrice(): number;
    abstract paint(): void;
    abstract getDetectionZones(): Phaser.Geom.Rectangle[];
    abstract getItemDetectionZone(): Phaser.Geom.Rectangle;
    abstract clear(): void;
    abstract moveTo(x: number, y: number): void;
    abstract getX(): number;
    abstract getY(): number;
    abstract areDetectionZonesOverlapping(gameItem: GameItem): boolean;
    abstract areDetectionZonesOverlappingWithRect(rect: Phaser.Geom.Rectangle): boolean;
    abstract isClicked(x: number, y: number): boolean;
    abstract getId(): number;
}

abstract class BasicItem extends GameItem {
    private readonly itemDetectionZoneMargin = TILE_SIZE / 5;
    private readonly id;

    x: number;
    y: number;
    width: number;
    height: number;
    verticalDetectionZone: Phaser.Geom.Rectangle;
    horizontalDetectionZone: Phaser.Geom.Rectangle;
    itemDetectionZone: Phaser.Geom.Rectangle;
    debugGraphics: Phaser.GameObjects.Graphics;
    image: Phaser.GameObjects.Image;
    price: number;

    protected constructor(x, y, id: number, scene: Phaser.Scene) {
        super();

        const itemData = getGameItemDataById(id);

        this.id = id;

        this.image = scene.add.image(x, y, itemData.imageName);
        this.image.setOrigin(0, 0);
        this.image.setDepth(ITEM_DEPTH);

        this.price = itemData.price;

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

        this.itemDetectionZone = new Phaser.Geom.Rectangle(
            x + this.itemDetectionZoneMargin,
            y + this.itemDetectionZoneMargin,
            TILE_SIZE - (this.itemDetectionZoneMargin * 2),
            TILE_SIZE - (this.itemDetectionZoneMargin * 2),
        );

        this.debugGraphics = scene.add.graphics();
    }


    isClicked(x: number, y: number): boolean {
        return Phaser.Geom.Rectangle.Contains(this.itemDetectionZone, x, y);
    }

    getId(): number {
        return this.id;
    }

    getItemDetectionZone(): Phaser.Geom.Rectangle {
        return this.itemDetectionZone;
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

        this.itemDetectionZone.x = this.x + this.itemDetectionZoneMargin;
        this.itemDetectionZone.y = this.y + this.itemDetectionZoneMargin;
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

            this.debugGraphics.lineStyle(1, 0xff00ff, 1);
            this.debugGraphics.strokeRect(
                this.itemDetectionZone.x - this.x,
                this.itemDetectionZone.y - this.y,
                this.itemDetectionZone.width,
                this.itemDetectionZone.height
            );
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
        return Phaser.Geom.Intersects.RectangleToRectangle(gameItem.getItemDetectionZone(), this.getItemDetectionZone());
    }

    getPrice(): number {
        return this.price;
    }

    areDetectionZonesOverlappingWithRect(rect: Phaser.Geom.Rectangle): boolean {
        const detectionZones = this.getDetectionZones();
        for (let i = 0; i < detectionZones.length; i++) {
            if (Phaser.Geom.Rectangle.Overlaps(detectionZones[i], rect)) {
                return true;
            }
        }
        return false;
    }
}

export class LogItem extends BasicItem {
    constructor(x, y, scene: Phaser.Scene) {
        super(x, y, LOG_ID, scene);
    }
}

export class PlankItem extends BasicItem {
    constructor(x, y, scene: Phaser.Scene) {
        super(x, y, PLANK_ID, scene);
    }
}


export class BeamItem extends BasicItem {
    constructor(x, y, scene: Phaser.Scene) {
        super(x, y, BEAM_ID, scene);
    }
}

export class NailItem extends BasicItem {
    constructor(x, y, scene: Phaser.Scene) {
        super(x, y, NAIL_ID, scene);
    }
}

export class SheetOfPaperItem extends BasicItem {
    constructor(x, y, scene: Phaser.Scene) {
        super(x, y, SHEET_OF_PAPER_ID, scene);
    }
}

export class ClothItem extends BasicItem {
    constructor(x, y, scene: Phaser.Scene) {
        super(x, y, CLOTH_ID, scene);
    }
}
export class SailItem extends BasicItem {
    constructor(x, y, scene: Phaser.Scene) {
        super(x, y, SAIL_ID, scene);
    }
}
export class ChairItem extends BasicItem {
    constructor(x, y, scene: Phaser.Scene) {
        super(x, y, CHAIR_ID, scene);
    }
}

export class TableItem extends BasicItem {
    constructor(x, y, scene: Phaser.Scene) {
        super(x, y, TABLE_ID, scene);
    }
}

export class SculptureItem extends BasicItem {
    constructor(x, y, scene: Phaser.Scene) {
        super(x, y, SCULPTURE_ID, scene);
    }
}

export class BoatItem extends BasicItem {
    constructor(x, y, scene: Phaser.Scene) {
        super(x, y, BOAT_ID, scene);
    }
}

export class SimpleSailboatItem extends BasicItem {
    constructor(x, y, scene: Phaser.Scene) {
        super(x, y, SIMPLE_SAILBOAT_ID, scene);
    }
}

export class BigSailboatItem extends BasicItem {
    constructor(x, y, scene: Phaser.Scene) {
        super(x, y, BIG_SAILBOAT_ID, scene);
    }
}

export class ShipItem extends BasicItem {
    constructor(x, y, scene: Phaser.Scene) {
        super(x, y, SHIP_ID, scene);
    }
}