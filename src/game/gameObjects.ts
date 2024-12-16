import {
    DEBUG,
    DEBUG_DEPTH,
    GRID_HEIGHT,
    GRID_WIDTH,
    OBJECT_DEPTH,
    OBJECT_SELECTION_DEPTH,
    TILE_SIZE
} from "./properties.js";
import {
    CONVEYOR_BELT_ID,
    CONVEYOR_BELT_LEFT_ID,
    CONVEYOR_BELT_RIGHT_ID,
    getGameObjectById,
    LOG_PRODUCER_ID, MERGER_ID,
    SAW_MILL_ID, SPLITTER_ID, STORAGE_ID, WOODEN_NAILS_WORKSHOP_ID,
    WORKSHOP_ID
} from "../common/GameObjectData.ts";
import {BeamItem, GameItem, LogItem, NailItem, PlankItem} from "./gameItems";
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

const NORTH = 0;
const EAST = 1;
const SOUTH = 2;
const WEST = 3;

const DIRECTIONS_TO_DEG = [270, 0, 90, 180];

const CANNOT_BE_PLACED_COLOR = 0xff0000;
const CAN_BE_PLACED_COLOR = 0x00ff00;

const SELECTION_LINE_WIDTH = 5;

class ProgressBar {

    backgroundGraphics: Phaser.GameObjects.Graphics;
    barGraphics: Phaser.GameObjects.Graphics;
    x: number;
    y: number;
    size: number;
    progressLength: number;

    constructor(scene, x, y, size) {
        this.backgroundGraphics = scene.add.graphics();
        this.barGraphics = scene.add.graphics();

        this.x = x;
        this.y = y;
        this.size = size;
        this.progressLength = 0;

        this.update();
    }

    update() {
        const height = 10;

        this.backgroundGraphics.clear();
        this.barGraphics.clear();

        this.backgroundGraphics.setDepth(OBJECT_DEPTH + 10);
        this.backgroundGraphics.fillStyle(0x000000, 0.5);
        this.backgroundGraphics.x = this.x;
        this.backgroundGraphics.y = this.y;
        this.backgroundGraphics.fillRect(0, 0, this.size, height);

        this.barGraphics.setDepth(OBJECT_DEPTH + 11);
        this.barGraphics.fillStyle(0x00ff00, 0.5);
        this.barGraphics.x = this.x;
        this.barGraphics.y = this.y;
        this.barGraphics.fillRect(0, 0, this.progressLength, height);
    }

    updateProgress(progress: number) {
        if (progress < 0) {
            progress = 0;
        }
        if (progress > 100) {
            progress = 100;
        }
        this.progressLength = (progress / 100.0) * this.size;

        this.update();
    }

    move(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.update();
    }

    clear() {
        this.backgroundGraphics.destroy();
        this.barGraphics.destroy();
    }

    setVisible(isVisible: boolean) {
        this.backgroundGraphics.setVisible(isVisible);
        this.barGraphics.setVisible(isVisible);
    }
}

export function createObject(id, scene) {
    switch (id) {
        case CONVEYOR_BELT_ID:
            return new ConveyorBelt(-5, -5, scene);
        case CONVEYOR_BELT_LEFT_ID:
            return new ConveyorBeltLeft(-5, -5, scene);
        case CONVEYOR_BELT_RIGHT_ID:
            return new ConveyorBeltRight(-5, -5, scene);
        case LOG_PRODUCER_ID:
            return new LogProducer(-5, -5, scene);
        case SAW_MILL_ID:
            return new SawMill(-5, -5, scene);
        case WORKSHOP_ID:
            return new Workshop(-5, -5, scene);
        case WOODEN_NAILS_WORKSHOP_ID:
            return new WoodenNailsWorkshop(-5, -5, scene);
        case SPLITTER_ID:
            return new Splitter(-5, -5, scene);
        case MERGER_ID:
            return new Merger(-5, -5, scene);
        case STORAGE_ID:
            return new Storage(-5, -5, scene);
    }
}

export abstract class GameObject {
    abstract getId(): number;

    abstract paint(): void;

    abstract canBePlaced(): boolean;

    abstract setVisible(isVisible: boolean): void;

    abstract clear(): void;

    abstract rotate(): void;

    abstract setSelected(selected: boolean): void;

    abstract update(items: GameItem[]): void;

    abstract move(gridX: number, gridY: number): void;

    abstract placeOnGrid(): void;

    abstract removeFromGrid(): void;

    abstract copy(): GameObject;

    abstract isMaxLevel(): boolean;

    abstract getUpgradePrice(): number;

    abstract getCurrentLevel(): number;

    abstract setLevel(level: number);
}

abstract class BasicObject extends GameObject {
    gridX: number;
    gridY: number;
    scene: Phaser.Scene;

    selectionGraphics: Phaser.GameObjects.Graphics;
    debugGraphics: Phaser.GameObjects.Graphics;
    incorrectPlacementGraphics: Phaser.GameObjects.Graphics;
    correctPlacementGraphics: Phaser.GameObjects.Graphics;
    sprite: Phaser.GameObjects.Sprite;

    direction: number;
    isSelected: boolean;
    isVisible: boolean;

    tileOffsets: { gridX: number; gridY: number }[];

    currentLevel: number;

    constructor(gridX, gridY, scene, tileOffsets = [{gridX: 0, gridY: 0}]) {
        super();

        this.gridX = gridX;
        this.gridY = gridY;
        this.scene = scene;
        this.isVisible = true;
        this.tileOffsets = tileOffsets;
        this.currentLevel = 1;

        const gameObjectData = getGameObjectById(this.getId());

        const minTileOffsetX = Math.min(...this.tileOffsets.map(tileOffset => tileOffset.gridX));
        const maxTileOffsetX = Math.max(...this.tileOffsets.map(tileOffset => tileOffset.gridX));
        const minTileOffsetY = Math.min(...this.tileOffsets.map(tileOffset => tileOffset.gridY));
        const maxTileOffsetY = Math.max(...this.tileOffsets.map(tileOffset => tileOffset.gridY));

        const numberOfXTiles = maxTileOffsetX - minTileOffsetX + 1;
        const numberOfYTiles = maxTileOffsetY - minTileOffsetY + 1;

        this.sprite = this.scene.add.sprite(
            this.gridX * TILE_SIZE + TILE_SIZE / 2,
            this.gridY * TILE_SIZE + TILE_SIZE / 2,
            gameObjectData.imageData.spriteName
        );
        this.sprite.setOrigin(
            (-1 * minTileOffsetX + 0.5) / numberOfXTiles,
            (-1 * minTileOffsetY + 0.5) / numberOfYTiles
        );
        this.sprite.setDepth(OBJECT_DEPTH);
        this.sprite.play(gameObjectData.imageData.spriteAnimationName, true);

        this.selectionGraphics = scene.add.graphics();
        this.selectionGraphics.lineStyle(SELECTION_LINE_WIDTH, 0xff0000, 1);
        this.selectionGraphics.strokeRect(
            -SELECTION_LINE_WIDTH,
            -SELECTION_LINE_WIDTH,
            TILE_SIZE + 2 * SELECTION_LINE_WIDTH,
            TILE_SIZE + 2 * SELECTION_LINE_WIDTH
        );
        this.selectionGraphics.x = this.gridX * TILE_SIZE;
        this.selectionGraphics.y = this.gridY * TILE_SIZE;
        this.selectionGraphics.setDepth(OBJECT_SELECTION_DEPTH);

        this.incorrectPlacementGraphics = scene.add.graphics();
        this.initializePlacementGraphics(this.incorrectPlacementGraphics, CANNOT_BE_PLACED_COLOR);

        this.correctPlacementGraphics = scene.add.graphics();
        this.initializePlacementGraphics(this.correctPlacementGraphics, CAN_BE_PLACED_COLOR);

        this.direction = EAST;
        this.isSelected = false;

        this.debugGraphics = scene.add.graphics();
        this.updateVisibility();
    }

    initializePlacementGraphics(placementGraphics: Phaser.GameObjects.Graphics, color: number) {
        placementGraphics.fillStyle(color, 0.2);
        placementGraphics.setDepth(OBJECT_SELECTION_DEPTH);
        this.tileOffsets.forEach(tile => {
            placementGraphics.fillRect(tile.gridX * TILE_SIZE, tile.gridY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        })
        placementGraphics.x = this.gridX * TILE_SIZE;
        placementGraphics.y = this.gridY * TILE_SIZE;
    }

    updateVisibility() {
        if (!this.isVisible) {
            this.sprite.setVisible(false);
            this.sprite.setVisible(false);
            this.selectionGraphics.setVisible(false);
            this.incorrectPlacementGraphics.setVisible(false);
            this.correctPlacementGraphics.setVisible(false);
            this.debugGraphics.setVisible(false);
            return;
        }

        this.sprite.setVisible(true);
        this.selectionGraphics.setVisible(this.isSelected);
        this.debugGraphics.setVisible(DEBUG);

        if (this.gridX < 0 || this.gridX >= GRID_WIDTH || this.gridY < 0 || this.gridY >= GRID_HEIGHT) {
            return;
        }
        if (this.scene.grid[this.gridX][this.gridY] === this) {
            this.correctPlacementGraphics.setVisible(false);
            this.incorrectPlacementGraphics.setVisible(false);
        } else if (this.canBePlaced()) {
            this.correctPlacementGraphics.setVisible(true);
            this.incorrectPlacementGraphics.setVisible(false);
        } else {
            this.correctPlacementGraphics.setVisible(false);
            this.incorrectPlacementGraphics.setVisible(true);
        }
    }

    paint() {
        this.updateVisibility();
    }

    canBePlaced() {
        for (let i = 0; i < this.tileOffsets.length; i++) {
            const tileOffset = this.tileOffsets[i];
            const gridX = this.gridX + tileOffset.gridX;
            const gridY = this.gridY + tileOffset.gridY;

            if (gridX < 0 || gridX >= GRID_WIDTH || gridY < 0 || gridY >= GRID_HEIGHT) {
                return false;
            }
            if (this.scene.grid[gridX][gridY]) {
                return false;
            }
        }

        return true;
    }

    clear() {
        this.selectionGraphics.clear();
        this.debugGraphics.clear();
        this.incorrectPlacementGraphics.clear();
        this.correctPlacementGraphics.clear();
        this.sprite.destroy();
    }

    rotate() {
        this.direction = (this.direction + 1) % 4;
        this.tileOffsets = this.tileOffsets.map(tile => {
            return {gridX: -1 * tile.gridY, gridY: tile.gridX}
        });

        this.incorrectPlacementGraphics.clear();
        this.correctPlacementGraphics.clear();
        this.initializePlacementGraphics(this.incorrectPlacementGraphics, CANNOT_BE_PLACED_COLOR);
        this.initializePlacementGraphics(this.correctPlacementGraphics, CAN_BE_PLACED_COLOR);

        this.sprite.setRotation(Phaser.Math.DegToRad(DIRECTIONS_TO_DEG[this.direction]));
        this.updateDetectionZones();
        this.repaintDebug();
    }

    setSelected(selected) {
        this.isSelected = selected;
        this.updateVisibility();
    }

    move(gridX: number, gridY: number): void {
        this.gridX = gridX;
        this.gridY = gridY;

        const x = this.gridX * TILE_SIZE;
        const y = this.gridY * TILE_SIZE;

        this.updateDetectionZones();

        this.sprite.x = x + TILE_SIZE / 2;
        this.sprite.y = y + TILE_SIZE / 2;
        this.selectionGraphics.x = x;
        this.selectionGraphics.y = y;
        this.incorrectPlacementGraphics.x = x;
        this.incorrectPlacementGraphics.y = y;
        this.correctPlacementGraphics.x = x;
        this.correctPlacementGraphics.y = y;

        this.repaintDebug();
    }

    updateDetectionZones() {
    }

    getDetectionZones(): Phaser.Geom.Rectangle[] {
        return [];
    }

    setVisible(isVisible: boolean): void {
        this.isVisible = isVisible;
        this.updateVisibility();
    }

    repaintDebug() {
        this.debugGraphics.clear();
        this.debugGraphics.setDepth(DEBUG_DEPTH);
        this.debugGraphics.lineStyle(1, 0xff00ff, 0.5);

        this.getDetectionZones().forEach(detectionZone => {
            this.debugGraphics.strokeRect(
                detectionZone.x,
                detectionZone.y,
                detectionZone.width,
                detectionZone.height
            );
        });

        this.debugGraphics.lineStyle(1, 0xffff00, 0.5);
        this.tileOffsets.forEach(tileOffset => {
            this.debugGraphics.strokeRect(
                (tileOffset.gridX + this.gridX) * TILE_SIZE,
                (tileOffset.gridY + this.gridY) * TILE_SIZE,
                TILE_SIZE,
                TILE_SIZE
            );
        });
        this.updateVisibility();
    }


    placeOnGrid() {
        for (let i = 0; i < this.tileOffsets.length; i++) {
            const tileOffset = this.tileOffsets[i];
            const gridX = this.gridX + tileOffset.gridX;
            const gridY = this.gridY + tileOffset.gridY;

            this.scene.grid[gridX][gridY] = this;
        }
    }

    removeFromGrid() {
        for (let i = 0; i < this.tileOffsets.length; i++) {
            const tileOffset = this.tileOffsets[i];
            const gridX = this.gridX + tileOffset.gridX;
            const gridY = this.gridY + tileOffset.gridY;

            this.scene.grid[gridX][gridY] = null;
        }
    }

    isMaxLevel(): boolean {
        return this.currentLevel >= getGameObjectById(this.getId()).upgrades.length;
    }

    getUpgradePrice(): number {
        return getGameObjectById(this.getId()).upgrades[this.currentLevel].price;
    }

    setLevel(level: number) {
        if (level > getGameObjectById(this.getId()).upgrades.length) {
            level = getGameObjectById(this.getId()).upgrades.length;
        }

        this.currentLevel = level;
        this.upgrade(getGameObjectById(this.getId()).upgrades[this.currentLevel - 1].details);
    }


    getCurrentLevel(): number {
        return this.currentLevel;
    }


    copy(): GameObject {
        const gameObject = createObject(this.getId(), this.scene);

        gameObject.tileOffsets = this.tileOffsets;
        gameObject.direction = this.direction;
        gameObject.isSelected = this.isSelected;
        gameObject.sprite.setRotation(Phaser.Math.DegToRad(DIRECTIONS_TO_DEG[this.direction]));
        gameObject.move(this.gridX, this.gridY);
        gameObject.updateVisibility();

        gameObject.incorrectPlacementGraphics.clear();
        gameObject.correctPlacementGraphics.clear();
        gameObject.initializePlacementGraphics(gameObject.incorrectPlacementGraphics, CANNOT_BE_PLACED_COLOR);
        gameObject.initializePlacementGraphics(gameObject.correctPlacementGraphics, CAN_BE_PLACED_COLOR);

        gameObject.setLevel(this.currentLevel);

        return gameObject;
    }

    abstract upgrade(details: object);
}

class ConveyorBelt extends BasicObject {
    detectionZone: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(
        0,
        0,
        0,
        0
    );
    speed: number;

    constructor(gridX, gridY, scene) {
        super(
            gridX,
            gridY,
            scene
        );
        this.speed = getGameObjectById(this.getId()).upgrades[0].details.speed;
    }

    getId(): number {
        return CONVEYOR_BELT_ID;
    }

    updateDetectionZones() {
        const detectionZoneSize = TILE_SIZE / 2;
        if (this.direction === NORTH || this.direction === SOUTH) {
            this.detectionZone.width = detectionZoneSize;
            this.detectionZone.height = TILE_SIZE;
            this.detectionZone.x = this.gridX * TILE_SIZE + TILE_SIZE / 2 - detectionZoneSize / 2;
            this.detectionZone.y = this.gridY * TILE_SIZE;
        } else {
            this.detectionZone.width = TILE_SIZE;
            this.detectionZone.height = detectionZoneSize;
            this.detectionZone.x = this.gridX * TILE_SIZE;
            this.detectionZone.y = this.gridY * TILE_SIZE + TILE_SIZE / 2 - detectionZoneSize / 2;
        }
    }

    getDetectionZones(): Phaser.Geom.Rectangle[] {
        return [this.detectionZone];
    }

    update(items) {
        for (let i = 0; i < items.length; i++) {
            let item = items[i];

            const itemDetectionZones = item.getDetectionZones();
            let overlapsWithObject = false;
            for (let i = 0; i < itemDetectionZones.length; i++) {
                const itemDetectionZone = itemDetectionZones[i];
                if (Phaser.Geom.Rectangle.Overlaps(itemDetectionZone, this.detectionZone)) {
                    overlapsWithObject = true;
                    break;
                }
            }
            if (!overlapsWithObject) {
                continue;
            }

            if (!shouldConveyorBeltMoveItem(item, items, this.direction)) {
                continue;
            }

            let newX = item.getX();
            let newY = item.getY();

            if (this.direction === NORTH) {
                newY -= this.speed;
            } else if (this.direction === EAST) {
                newX += this.speed;
            } else if (this.direction === SOUTH) {
                newY += this.speed;
            } else if (this.direction === WEST) {
                newX -= this.speed;
            }

            item.moveTo(newX, newY);
        }
    }

    upgrade(details: object) {
        this.speed = details.speed;
    }
}

class ConveyorBeltLeft extends BasicObject {
    initialDetectionZone: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(
        0,
        0,
        0,
        0
    );
    turnDetectionZone: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(
        0,
        0,
        0,
        0
    );
    speed: number;

    constructor(gridX, gridY, scene) {
        super(
            gridX,
            gridY,
            scene
        );
        this.speed = getGameObjectById(this.getId()).upgrades[0].details.speed;
    }

    upgrade(details: object) {
        this.speed = details.speed;
    }

    getId(): number {
        return CONVEYOR_BELT_LEFT_ID;
    }

    updateDetectionZones() {
        updateTurnedConveyorBeltDetectionZone(this.initialDetectionZone, this.direction, this.gridX, this.gridY, TILE_SIZE / 10);
        updateTurnedConveyorBeltDetectionZone(this.turnDetectionZone, (this.direction + 1) % 4, this.gridX, this.gridY, TILE_SIZE / 4);
    }

    getDetectionZones(): Phaser.Geom.Rectangle[] {
        return [this.initialDetectionZone, this.turnDetectionZone];
    }

    update(items) {
        for (let i = 0; i < items.length; i++) {
            let item = items[i];

            let overlapsInitialDetectionZone = false;
            let overlapsTurnDetectionZone = false;

            for (let j = 0; j < item.getDetectionZones().length; j++) {
                const itemDetectionZone = item.getDetectionZones()[j];
                if (Phaser.Geom.Rectangle.Overlaps(itemDetectionZone, this.initialDetectionZone)) {
                    overlapsInitialDetectionZone = true;
                    break;
                }
            }
            for (let j = 0; j < item.getDetectionZones().length; j++) {
                const itemDetectionZone = item.getDetectionZones()[j];
                if (Phaser.Geom.Rectangle.Overlaps(itemDetectionZone, this.turnDetectionZone)) {
                    overlapsTurnDetectionZone = true;
                    break;
                }
            }

            if (!overlapsInitialDetectionZone && !overlapsTurnDetectionZone) {
                continue;
            }

            if (overlapsInitialDetectionZone && !shouldConveyorBeltMoveItem(item, items, this.direction)) {
                continue;
            }

            const secondDirection = (this.direction + 3) % 4;
            if (overlapsTurnDetectionZone && !shouldConveyorBeltMoveItem(item, items, secondDirection)) {
                continue;
            }

            let newX = item.getX();
            let newY = item.getY();

            if (overlapsInitialDetectionZone) {
                if (this.direction === NORTH) {
                    newY -= this.speed;
                } else if (this.direction === EAST) {
                    newX += this.speed;
                } else if (this.direction === SOUTH) {
                    newY += this.speed;
                } else if (this.direction === WEST) {
                    newX -= this.speed;
                }
            }

            if (overlapsTurnDetectionZone) {
                if (secondDirection === NORTH) {
                    newY -= this.speed;
                } else if (secondDirection === EAST) {
                    newX += this.speed;
                } else if (secondDirection === SOUTH) {
                    newY += this.speed;
                } else if (secondDirection === WEST) {
                    newX -= this.speed;
                }
            }

            item.moveTo(newX, newY);
        }
    }
}

class ConveyorBeltRight extends BasicObject {
    initialDetectionZone: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(
        0,
        0,
        0,
        0
    );
    turnDetectionZone: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(
        0,
        0,
        0,
        0
    );
    speed: number;

    constructor(gridX, gridY, scene) {
        super(
            gridX,
            gridY,
            scene
        );
        this.speed = getGameObjectById(this.getId()).upgrades[0].details.speed;
    }

    getId(): number {
        return CONVEYOR_BELT_RIGHT_ID;
    }

    updateDetectionZones() {
        updateTurnedConveyorBeltDetectionZone(this.initialDetectionZone, this.direction, this.gridX, this.gridY, TILE_SIZE / 10);
        updateTurnedConveyorBeltDetectionZone(this.turnDetectionZone, (this.direction + 3) % 4, this.gridX, this.gridY, TILE_SIZE / 4);
    }

    getDetectionZones(): Phaser.Geom.Rectangle[] {
        return [this.initialDetectionZone, this.turnDetectionZone];
    }

    update(items) {
        for (let i = 0; i < items.length; i++) {
            let item = items[i];

            let overlapsInitialDetectionZone = false;
            let overlapsTurnDetectionZone = false;

            for (let j = 0; j < item.getDetectionZones().length; j++) {
                const itemDetectionZone = item.getDetectionZones()[j];
                if (Phaser.Geom.Rectangle.Overlaps(itemDetectionZone, this.initialDetectionZone)) {
                    overlapsInitialDetectionZone = true;
                    break;
                }
            }
            for (let j = 0; j < item.getDetectionZones().length; j++) {
                const itemDetectionZone = item.getDetectionZones()[j];
                if (Phaser.Geom.Rectangle.Overlaps(itemDetectionZone, this.turnDetectionZone)) {
                    overlapsTurnDetectionZone = true;
                    break;
                }
            }

            if (!overlapsInitialDetectionZone && !overlapsTurnDetectionZone) {
                continue;
            }

            if (overlapsInitialDetectionZone && !shouldConveyorBeltMoveItem(item, items, this.direction)) {
                continue;
            }

            const secondDirection = (this.direction + 1) % 4;
            if (overlapsTurnDetectionZone && !shouldConveyorBeltMoveItem(item, items, secondDirection)) {
                continue;
            }

            let newX = item.getX();
            let newY = item.getY();

            if (overlapsInitialDetectionZone) {
                if (this.direction === NORTH) {
                    newY -= this.speed;
                } else if (this.direction === EAST) {
                    newX += this.speed;
                } else if (this.direction === SOUTH) {
                    newY += this.speed;
                } else if (this.direction === WEST) {
                    newX -= this.speed;
                }
            }

            if (overlapsTurnDetectionZone) {
                if (secondDirection === NORTH) {
                    newY -= this.speed;
                } else if (secondDirection === EAST) {
                    newX += this.speed;
                } else if (secondDirection === SOUTH) {
                    newY += this.speed;
                } else if (secondDirection === WEST) {
                    newX -= this.speed;
                }
            }

            item.moveTo(newX, newY);
        }
    }

    upgrade(details: object) {
        this.speed = details.speed;
    }
}

function shouldConveyorBeltMoveItem(item: GameItem, items: GameItem[], direction: number): boolean {
    for (let i = 0; i < items.length; i++) {
        const distanceMargin = TILE_SIZE * 0.4;
        const currentItem = items[i];
        if (currentItem === item) {
            continue;
        }

        const horizontalDifference = Math.abs(currentItem.getX() - item.getX());
        const verticalDifference = Math.abs(currentItem.getY() - item.getY());

        if ((direction === NORTH || direction === SOUTH) && horizontalDifference > distanceMargin) {
            continue;
        }
        if ((direction === EAST || direction === WEST) && verticalDifference > distanceMargin) {
            continue;
        }

        if (direction === NORTH && currentItem.getY() >= item.getY()) {
            continue;
        }
        if (direction === EAST && currentItem.getX() <= item.getX()) {
            continue;
        }
        if (direction === SOUTH && currentItem.getY() <= item.getY()) {
            continue;
        }
        if (direction === WEST && currentItem.getX() >= item.getX()) {
            continue;
        }

        if (item.areDetectionZonesOverlapping(currentItem)) {
            return false;
        }
    }

    return true;
}

function updateTurnedConveyorBeltDetectionZone(
    detectionZone: Phaser.Geom.Rectangle,
    direction: number,
    gridX: number,
    gridY: number,
    detectionZoneLength: number
) {
    const detectionZoneSize = TILE_SIZE / 2;

    if (direction === NORTH) {
        detectionZone.width = detectionZoneSize;
        detectionZone.height = detectionZoneLength;
        detectionZone.x = gridX * TILE_SIZE + TILE_SIZE / 2 - detectionZoneSize / 2;
        detectionZone.y = gridY * TILE_SIZE + TILE_SIZE - detectionZoneLength;
    } else if (direction === EAST) {
        detectionZone.width = detectionZoneLength;
        detectionZone.height = detectionZoneSize;
        detectionZone.x = gridX * TILE_SIZE;
        detectionZone.y = gridY * TILE_SIZE + TILE_SIZE / 2 - detectionZoneSize / 2;
    } else if (direction === SOUTH) {
        detectionZone.width = detectionZoneSize;
        detectionZone.height = detectionZoneLength;
        detectionZone.x = gridX * TILE_SIZE + TILE_SIZE / 2 - detectionZoneSize / 2;
        detectionZone.y = gridY * TILE_SIZE;
    } else if (direction === WEST) {
        detectionZone.width = detectionZoneLength;
        detectionZone.height = detectionZoneSize;
        detectionZone.x = gridX * TILE_SIZE + TILE_SIZE - detectionZoneLength;
        detectionZone.y = gridY * TILE_SIZE + TILE_SIZE / 2 - detectionZoneSize / 2;
    }
}


class LogProducer extends BasicObject {
    lastProducedTimestampInMs: number = 0;
    detectionZone: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(
        0,
        0,
        0,
        0
    );
    productionTimeMs: number;
    progressBar: ProgressBar;

    constructor(gridX, gridY, scene) {
        super(
            gridX,
            gridY,
            scene,
            [
                {gridX: 0, gridY: -1},
                {gridX: 0, gridY: 0},
                {gridX: 0, gridY: 1},
            ]
        );
        this.lastProducedTimestampInMs = new Date().getTime();
        this.productionTimeMs = getGameObjectById(this.getId()).upgrades[0].details.productionTimeMs;
        this.progressBar = new ProgressBar(this.scene, gridX * TILE_SIZE, gridY * TILE_SIZE, TILE_SIZE);
    }

    setVisible(isVisible: boolean) {
        super.setVisible(isVisible);
        this.progressBar.setVisible(isVisible);
    }

    updateDetectionZones() {
        this.detectionZone.width = TILE_SIZE;
        this.detectionZone.height = TILE_SIZE;
        this.detectionZone.x = this.gridX * TILE_SIZE + TILE_SIZE * 0.8;
        this.detectionZone.y = this.gridY * TILE_SIZE;

        this.progressBar.move(this.gridX * TILE_SIZE, this.gridY * TILE_SIZE);
    }

    getDetectionZones(): Phaser.Geom.Rectangle[] {
        return [this.detectionZone];
    }

    getId(): number {
        return LOG_PRODUCER_ID;
    }

    rotate() {
    }

    update(items: GameItem[]) {
        const currentTime = new Date().getTime();
        if (currentTime - this.lastProducedTimestampInMs < this.productionTimeMs) {
            const progress = (currentTime - this.lastProducedTimestampInMs) / this.productionTimeMs * 100;
            this.progressBar.updateProgress(progress);
            return;
        }

        this.progressBar.updateProgress(100);
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            for (let j = 0; j < item.getDetectionZones().length; j++) {
                const detectionZone = item.getDetectionZones()[j];
                if (Phaser.Geom.Rectangle.Overlaps(detectionZone, this.detectionZone)) {
                    return;
                }
            }
        }

        const logItem = new LogItem(
            this.detectionZone.x,
            this.detectionZone.y,
            this.scene
        );

        this.scene.items.push(logItem);
        logItem.paint();

        this.lastProducedTimestampInMs = currentTime;
        this.progressBar.updateProgress(0);
    }

    canBePlaced(): boolean {
        if (this.gridX !== 0) {
            return false;
        }

        return super.canBePlaced();
    }

    upgrade(details: object) {
        this.productionTimeMs = details.productionTimeMs;
    }

    clear() {
        super.clear();
        this.progressBar.clear();
    }
}

abstract class InOutObject extends BasicObject {
    private productionTimeMs: number;
    private progressBar: ProgressBar;
    private hasItem: boolean = false;
    private productionStartTimestampInMs: number = 0;

    private inDetectionZone: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(
        0,
        0,
        0,
        0
    );
    private outDetectionZone: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(
        0,
        0,
        0,
        0
    );

    constructor(gridX, gridY, scene) {
        super(
            gridX,
            gridY,
            scene,
            [
                {gridX: -1, gridY: 0},
                {gridX: 0, gridY: 0}
            ]
        );
        this.productionTimeMs = getGameObjectById(this.getId()).upgrades[0].details.productionTimeMs;
        this.progressBar = new ProgressBar(this.scene, gridX * TILE_SIZE, gridY * TILE_SIZE, TILE_SIZE);
    }

    getDetectionZones(): Phaser.Geom.Rectangle[] {
        return [this.outDetectionZone, this.inDetectionZone];
    }

    updateDetectionZones() {
        const detectorSize = TILE_SIZE / 10;

        if (this.direction === EAST || this.direction === WEST) {
            this.inDetectionZone.width = detectorSize;
            this.inDetectionZone.height = TILE_SIZE;
            this.inDetectionZone.y = this.gridY * TILE_SIZE;

            this.outDetectionZone.width = detectorSize;
            this.outDetectionZone.height = TILE_SIZE;
            this.outDetectionZone.y = this.gridY * TILE_SIZE;
        } else {
            this.inDetectionZone.width = TILE_SIZE;
            this.inDetectionZone.height = detectorSize;
            this.inDetectionZone.x = this.gridX * TILE_SIZE;

            this.outDetectionZone.width = TILE_SIZE;
            this.outDetectionZone.height = detectorSize;
            this.outDetectionZone.x = this.gridX * TILE_SIZE;
        }

        if (this.direction === NORTH) {
            this.inDetectionZone.y = this.gridY * TILE_SIZE + TILE_SIZE;
            this.outDetectionZone.y = this.gridY * TILE_SIZE - detectorSize;
        } else if (this.direction === EAST) {
            this.inDetectionZone.x = this.gridX * TILE_SIZE - detectorSize;
            this.outDetectionZone.x = this.gridX * TILE_SIZE + TILE_SIZE;
        } else if (this.direction === SOUTH) {
            this.inDetectionZone.y = this.gridY * TILE_SIZE - detectorSize;
            this.outDetectionZone.y = this.gridY * TILE_SIZE + TILE_SIZE;
        } else if (this.direction === WEST) {
            this.inDetectionZone.x = this.gridX * TILE_SIZE + TILE_SIZE;
            this.outDetectionZone.x = this.gridX * TILE_SIZE - detectorSize;
        }

        this.progressBar.move(this.gridX * TILE_SIZE, this.gridY * TILE_SIZE);
    }

    update(items: GameItem[]): void {
        if (this.hasItem) {
            const currentTime = new Date().getTime();
            if (currentTime - this.productionStartTimestampInMs < this.productionTimeMs) {
                const progress = (currentTime - this.productionStartTimestampInMs) / this.productionTimeMs * 100;
                this.progressBar.updateProgress(progress);
                return;
            }

            this.progressBar.updateProgress(100);

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                let detectionZones = item.getDetectionZones();
                for (let j = 0; j < detectionZones.length; j++) {
                    if (Phaser.Geom.Rectangle.Overlaps(detectionZones[j], this.outDetectionZone)) {
                        return;
                    }
                }
            }

            let x = this.outDetectionZone.x;
            let y = this.outDetectionZone.y;
            if (this.direction === WEST) {
                x -= TILE_SIZE;
            } else if (this.direction === NORTH) {
                y -= TILE_SIZE;
            }
            this.produceItems(x, y, this.scene).forEach(newItem => {
                this.scene.items.push(newItem);
                newItem.paint();
            });
            this.progressBar.updateProgress(0);
            this.hasItem = false;
            return;
        }

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            if (!this.isInputItemAcceptable(item)) {
                continue;
            }

            let detectionZones = item.getDetectionZones();
            for (let j = 0; j < detectionZones.length; j++) {
                if (Phaser.Geom.Rectangle.Overlaps(detectionZones[j], this.inDetectionZone)) {
                    this.hasItem = true;
                    this.productionStartTimestampInMs = new Date().getTime();
                    this.scene.removeItem(item);
                }
            }
        }
    }

    upgrade(details: object) {
        this.productionTimeMs = details.productionTimeMs;
    }

    clear() {
        super.clear();
        this.progressBar.clear();
    }


    setVisible(isVisible: boolean) {
        super.setVisible(isVisible);
        this.progressBar.setVisible(isVisible);
    }

    abstract produceItems(x: number, y: number, scene: Phaser.Scene): GameItem[];

    abstract isInputItemAcceptable(item: GameItem): boolean;
}

class SawMill extends InOutObject {
    constructor(gridX, gridY, scene) {
        super(gridX, gridY, scene);
    }

    getId(): number {
        return SAW_MILL_ID;
    }

    produceItems(x: number, y: number, scene: Phaser.Scene) {
        return [new PlankItem(x, y, scene)];
    }

    isInputItemAcceptable(item: GameItem): boolean {
        return item instanceof LogItem;
    }
}

class Workshop extends InOutObject {
    constructor(gridX, gridY, scene) {
        super(gridX, gridY, scene);
    }

    getId(): number {
        return WORKSHOP_ID;
    }

    produceItems(x: number, y: number, scene: Phaser.Scene) {
        return [new BeamItem(x, y, scene)];
    }

    isInputItemAcceptable(item: GameItem): boolean {
        return item instanceof LogItem;
    }
}

class WoodenNailsWorkshop extends InOutObject {
    constructor(gridX, gridY, scene) {
        super(gridX, gridY, scene);
    }

    getId(): number {
        return WOODEN_NAILS_WORKSHOP_ID;
    }

    produceItems(x: number, y: number, scene: Phaser.Scene) {
        return [new NailItem(x, y, scene), new NailItem(x + 3, y + 3, scene)];
    }

    isInputItemAcceptable(item: GameItem): boolean {
        return item instanceof PlankItem;
    }
}

class Splitter extends BasicObject {
    private inDetectionZone: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(
        0,
        0,
        0,
        0
    );
    private outLeftDetectionZone: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(
        0,
        0,
        0,
        0
    );
    private outRightDetectionZone: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(
        0,
        0,
        0,
        0
    );
    private usedLeftLastTime = false;

    constructor(gridX, gridY, scene) {
        super(
            gridX,
            gridY,
            scene,
            [
                {gridX: -1, gridY: 0},
                {gridX: 0, gridY: 0}
            ]
        );
    }

    updateDetectionZones() {
        const detectorSize = TILE_SIZE / 10;

        if (this.direction === EAST || this.direction === WEST) {
            this.inDetectionZone.width = detectorSize;
            this.inDetectionZone.height = TILE_SIZE;
            this.inDetectionZone.y = this.gridY * TILE_SIZE;

            this.outLeftDetectionZone.width = TILE_SIZE;
            this.outLeftDetectionZone.height = detectorSize;
            this.outLeftDetectionZone.x = this.gridX * TILE_SIZE;

            this.outRightDetectionZone.width = TILE_SIZE;
            this.outRightDetectionZone.height = detectorSize;
            this.outRightDetectionZone.x = this.gridX * TILE_SIZE;
        } else {
            this.inDetectionZone.width = TILE_SIZE;
            this.inDetectionZone.height = detectorSize;
            this.inDetectionZone.x = this.gridX * TILE_SIZE;

            this.outLeftDetectionZone.width = detectorSize;
            this.outLeftDetectionZone.height = TILE_SIZE;
            this.outLeftDetectionZone.y = this.gridY * TILE_SIZE;

            this.outRightDetectionZone.width = detectorSize;
            this.outRightDetectionZone.height = TILE_SIZE;
            this.outRightDetectionZone.y = this.gridY * TILE_SIZE;
        }

        if (this.direction === NORTH) {
            this.inDetectionZone.y = this.gridY * TILE_SIZE + TILE_SIZE;
            this.outLeftDetectionZone.x = this.gridX * TILE_SIZE - detectorSize;
            this.outRightDetectionZone.x = this.gridX * TILE_SIZE + TILE_SIZE;
        } else if (this.direction === EAST) {
            this.inDetectionZone.x = this.gridX * TILE_SIZE - detectorSize;
            this.outLeftDetectionZone.y = this.gridY * TILE_SIZE - detectorSize;
            this.outRightDetectionZone.y = this.gridY * TILE_SIZE + TILE_SIZE;
        } else if (this.direction === SOUTH) {
            this.inDetectionZone.y = this.gridY * TILE_SIZE - detectorSize;
            this.outLeftDetectionZone.x = this.gridX * TILE_SIZE + TILE_SIZE;
            this.outRightDetectionZone.x = this.gridX * TILE_SIZE - detectorSize;
        } else if (this.direction === WEST) {
            this.inDetectionZone.x = this.gridX * TILE_SIZE + TILE_SIZE;
            this.outLeftDetectionZone.y = this.gridY * TILE_SIZE + TILE_SIZE;
            this.outRightDetectionZone.y = this.gridY * TILE_SIZE - detectorSize;
        }
    }

    getDetectionZones(): Phaser.Geom.Rectangle[] {
        return [this.inDetectionZone, this.outRightDetectionZone, this.outLeftDetectionZone];
    }

    getId(): number {
        return SPLITTER_ID;
    }

    update(items: GameItem[]): void {
        const itemIn = getFirstItemThatOverlapsWithRectangle(this.inDetectionZone, items);
        if (!itemIn) {
            return;
        }

        const isLeftOutOccupied = getFirstItemThatOverlapsWithRectangle(this.outLeftDetectionZone, items) !== null;
        const isRightOutOccupied = getFirstItemThatOverlapsWithRectangle(this.outRightDetectionZone, items) !== null;

        if (isLeftOutOccupied && isRightOutOccupied) {
            return;
        }

        if (this.usedLeftLastTime) {
            if (!isRightOutOccupied) {
                this.moveItemToRight(itemIn);
                this.usedLeftLastTime = false;
            } else {
                this.moveItemToLeft(itemIn);
            }
        } else {
            if (!isLeftOutOccupied) {
                this.moveItemToLeft(itemIn);
                this.usedLeftLastTime = true;
            } else {
                this.moveItemToRight(itemIn);
            }
        }
    }

    moveItemToLeft(item: GameItem): void {
        let x = this.outLeftDetectionZone.x;
        let y = this.outLeftDetectionZone.y;
        if (this.direction === EAST) {
            y -= TILE_SIZE - this.outLeftDetectionZone.height;
        } else if (this.direction === NORTH) {
            x -= TILE_SIZE - this.outLeftDetectionZone.width;
        }

        item.moveTo(x, y);
    }

    moveItemToRight(item: GameItem): void {
        let x = this.outRightDetectionZone.x;
        let y = this.outRightDetectionZone.y;
        if (this.direction === WEST) {
            y -= TILE_SIZE - this.outRightDetectionZone.height;
        } else if (this.direction === SOUTH) {
            x -= TILE_SIZE - this.outRightDetectionZone.width;
        }

        item.moveTo(x, y);
    }

    upgrade(details: object) {
    }
}

class Merger extends BasicObject {
    leftInDetectionZone: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(0, 0, 0, 0);
    rightInDetectionZone: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(0, 0, 0, 0);
    outDetectionZone: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(0, 0, 0, 0);

    usedLeftLastTime = true;

    constructor(gridX, gridY, scene) {
        super(
            gridX,
            gridY,
            scene,
            [
                {gridX: -1, gridY: -1},
                {gridX: -1, gridY: 0},
                {gridX: 0, gridY: -1},
                {gridX: 0, gridY: 0}
            ]
        );
    }


    getDetectionZones(): Phaser.Geom.Rectangle[] {
        return [this.leftInDetectionZone, this.rightInDetectionZone, this.outDetectionZone];
    }

    updateDetectionZones() {
        const detectorSize = TILE_SIZE / 10;

        if (this.direction === EAST) {
            this.leftInDetectionZone.width = detectorSize;
            this.leftInDetectionZone.height = TILE_SIZE;
            this.leftInDetectionZone.y = (this.gridY - 1) * TILE_SIZE;
            this.leftInDetectionZone.x = this.gridX * TILE_SIZE - detectorSize;

            this.rightInDetectionZone.width = detectorSize;
            this.rightInDetectionZone.height = TILE_SIZE;
            this.rightInDetectionZone.y = this.gridY * TILE_SIZE;
            this.rightInDetectionZone.x = this.gridX * TILE_SIZE - detectorSize;

            this.outDetectionZone.width = detectorSize;
            this.outDetectionZone.height = TILE_SIZE;
            this.outDetectionZone.y = this.gridY * TILE_SIZE;
            this.outDetectionZone.x = (this.gridX + 1) * TILE_SIZE;
        } else if (this.direction === SOUTH) {
            this.leftInDetectionZone.width = TILE_SIZE;
            this.leftInDetectionZone.height = detectorSize;
            this.leftInDetectionZone.x = (this.gridX + 1) * TILE_SIZE;
            this.leftInDetectionZone.y = this.gridY * TILE_SIZE - detectorSize;

            this.rightInDetectionZone.width = TILE_SIZE;
            this.rightInDetectionZone.height = detectorSize;
            this.rightInDetectionZone.x = this.gridX * TILE_SIZE;
            this.rightInDetectionZone.y = this.gridY * TILE_SIZE - detectorSize;

            this.outDetectionZone.width = TILE_SIZE;
            this.outDetectionZone.height = detectorSize;
            this.outDetectionZone.x = this.gridX * TILE_SIZE;
            this.outDetectionZone.y = (this.gridY + 1) * TILE_SIZE;
        } else if (this.direction === WEST) {
            this.leftInDetectionZone.width = detectorSize;
            this.leftInDetectionZone.height = TILE_SIZE;
            this.leftInDetectionZone.y = (this.gridY + 1) * TILE_SIZE;
            this.leftInDetectionZone.x = (this.gridX + 1) * TILE_SIZE;

            this.rightInDetectionZone.width = detectorSize;
            this.rightInDetectionZone.height = TILE_SIZE;
            this.rightInDetectionZone.y = this.gridY * TILE_SIZE;
            this.rightInDetectionZone.x = (this.gridX + 1) * TILE_SIZE;

            this.outDetectionZone.width = detectorSize;
            this.outDetectionZone.height = TILE_SIZE;
            this.outDetectionZone.y = this.gridY * TILE_SIZE;
            this.outDetectionZone.x = this.gridX * TILE_SIZE - detectorSize;
        } else if (this.direction === NORTH) {
            this.leftInDetectionZone.width = TILE_SIZE;
            this.leftInDetectionZone.height = detectorSize;
            this.leftInDetectionZone.x = (this.gridX - 1) * TILE_SIZE;
            this.leftInDetectionZone.y = (this.gridY + 1) * TILE_SIZE;

            this.rightInDetectionZone.width = TILE_SIZE;
            this.rightInDetectionZone.height = detectorSize;
            this.rightInDetectionZone.x = this.gridX * TILE_SIZE;
            this.rightInDetectionZone.y = (this.gridY + 1) * TILE_SIZE;

            this.outDetectionZone.width = TILE_SIZE;
            this.outDetectionZone.height = detectorSize;
            this.outDetectionZone.x = this.gridX * TILE_SIZE;
            this.outDetectionZone.y = this.gridY * TILE_SIZE - detectorSize;
        }
    }

    getId(): number {
        return MERGER_ID;
    }

    update(items: GameItem[]): void {
        const isOutOccupied = getFirstItemThatOverlapsWithRectangle(this.outDetectionZone, items) !== null;
        if (isOutOccupied) {
            return;
        }

        const leftInItem = getFirstItemThatOverlapsWithRectangle(this.leftInDetectionZone, items);
        const rightInItem = getFirstItemThatOverlapsWithRectangle(this.rightInDetectionZone, items);

        if (!leftInItem && !rightInItem) {
            return;
        }

        if (this.usedLeftLastTime) {
            if (rightInItem) {
                this.usedLeftLastTime = false;
                this.moveItem(rightInItem);
            } else if (leftInItem) {
                this.moveItem(leftInItem);
            }
        } else {
            if (leftInItem) {
                this.usedLeftLastTime = true;
                this.moveItem(leftInItem);
            } else if (rightInItem) {
                this.moveItem(rightInItem);
            }
        }
    }

    moveItem(item: GameItem) {
        let x = this.outDetectionZone.x;
        let y = this.outDetectionZone.y;
        if (this.direction === WEST) {
            x -= TILE_SIZE - this.outDetectionZone.width;
        } else if (this.direction === NORTH) {
            y -= TILE_SIZE - this.outDetectionZone.height;
        }
        item.moveTo(x, y);
    }

    upgrade(details: object) {
    }
}

class Storage extends BasicObject {
    private inDetectionZone: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(
        0,
        0,
        0,
        0
    );
    private outDetectionZone: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(
        0,
        0,
        0,
        0
    );
    private capacity: number;
    private storedItems = [];
    private progressBar: ProgressBar;

    constructor(gridX, gridY, scene) {
        super(
            gridX,
            gridY,
            scene,
            [
                {gridX: -1, gridY: 0},
                {gridX: 0, gridY: -1},
                {gridX: 0, gridY: 0}
            ]
        );
        this.capacity = getGameObjectById(this.getId()).upgrades[0].details.capacity;
        this.progressBar = new ProgressBar(this.scene, gridX * TILE_SIZE, gridY * TILE_SIZE, TILE_SIZE);
    }

    getId(): number {
        return STORAGE_ID;
    }

    getDetectionZones(): Phaser.Geom.Rectangle[] {
        return [this.outDetectionZone, this.inDetectionZone];
    }

    updateDetectionZones() {
        const detectorSize = TILE_SIZE / 10;

        if (this.direction === EAST || this.direction === WEST) {
            this.inDetectionZone.width = detectorSize;
            this.inDetectionZone.height = TILE_SIZE;
            this.inDetectionZone.y = this.gridY * TILE_SIZE;

            this.outDetectionZone.width = detectorSize;
            this.outDetectionZone.height = TILE_SIZE;
            this.outDetectionZone.y = this.gridY * TILE_SIZE;
        } else {
            this.inDetectionZone.width = TILE_SIZE;
            this.inDetectionZone.height = detectorSize;
            this.inDetectionZone.x = this.gridX * TILE_SIZE;

            this.outDetectionZone.width = TILE_SIZE;
            this.outDetectionZone.height = detectorSize;
            this.outDetectionZone.x = this.gridX * TILE_SIZE;
        }

        if (this.direction === NORTH) {
            this.inDetectionZone.y = this.gridY * TILE_SIZE + TILE_SIZE;
            this.outDetectionZone.y = this.gridY * TILE_SIZE - detectorSize;
        } else if (this.direction === EAST) {
            this.inDetectionZone.x = this.gridX * TILE_SIZE - detectorSize;
            this.outDetectionZone.x = this.gridX * TILE_SIZE + TILE_SIZE;
        } else if (this.direction === SOUTH) {
            this.inDetectionZone.y = this.gridY * TILE_SIZE - detectorSize;
            this.outDetectionZone.y = this.gridY * TILE_SIZE + TILE_SIZE;
        } else if (this.direction === WEST) {
            this.inDetectionZone.x = this.gridX * TILE_SIZE + TILE_SIZE;
            this.outDetectionZone.x = this.gridX * TILE_SIZE - detectorSize;
        }

        this.progressBar.move(this.gridX * TILE_SIZE, this.gridY * TILE_SIZE);
    }


    update(items: GameItem[]): void {
        if (this.storedItems.length < this.capacity) {
            const item = getFirstItemThatOverlapsWithRectangle(this.inDetectionZone, items);
            if (item) {
                item.moveTo(TILE_SIZE*GRID_WIDTH*2, TILE_SIZE*GRID_HEIGHT*2);
                this.storedItems.push(item);
                this.progressBar.updateProgress(this.storedItems.length / this.capacity * 100);
            }
        }

        if (this.storedItems.length > 0 && getFirstItemThatOverlapsWithRectangle(this.outDetectionZone, items) === null) {
            const item = this.storedItems.shift();
            let x = this.outDetectionZone.x;
            let y = this.outDetectionZone.y;
            if (this.direction === WEST) {
                x -= TILE_SIZE - this.outDetectionZone.width;
            } else if (this.direction === NORTH) {
                y -= TILE_SIZE - this.outDetectionZone.height;
            }
            item.moveTo(x, y);
            this.progressBar.updateProgress(this.storedItems.length / this.capacity * 100);
        }
    }

    upgrade(details: object) {
        this.capacity = details.capacity;
        this.progressBar.updateProgress(this.storedItems.length / this.capacity * 100);
    }

    setVisible(isVisible: boolean) {
        super.setVisible(isVisible);
        this.progressBar.setVisible(isVisible);
    }


    clear() {
        super.clear();
        this.progressBar.clear();
    }
}

function getFirstItemThatOverlapsWithRectangle(rect: Phaser.Geom.Rectangle, items: GameItem[]): GameItem | null {
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.areDetectionZonesOverlappingWithRect(rect)) {
            return item;
        }
    }

    return null;
}