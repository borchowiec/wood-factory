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
    LOG_PRODUCER_ID
} from "../common/GameObjectData.ts";
import {GameItem, LogItem} from "./gameItems";
import * as Phaser from "phaser";

const NORTH = 0;
const EAST = 1;
const SOUTH = 2;
const WEST = 3;

const DIRECTIONS_TO_DEG = [270, 0, 90, 180];

const CANNOT_BE_PLACED_COLOR = 0xff0000;
const CAN_BE_PLACED_COLOR = 0x00ff00;

const SELECTION_LINE_WIDTH = 5;

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

    constructor(gridX, gridY, scene, tileOffsets = [{gridX: 0, gridY: 0}]) {
        super();

        this.gridX = gridX;
        this.gridY = gridY;
        this.scene = scene;
        this.isVisible = true;
        this.tileOffsets = tileOffsets;

        const gameObjectData = getGameObjectById(this.getId());

        this.sprite = this.scene.add.sprite(
            this.gridX * TILE_SIZE + TILE_SIZE / 2,
            this.gridY * TILE_SIZE + TILE_SIZE / 2,
            gameObjectData.imageData.spriteName
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
}

class ConveyorBelt extends BasicObject {
    detectionZone: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(
        0,
        0,
        0,
        0
    );

    constructor(gridX, gridY, scene) {
        super(
            gridX,
            gridY,
            scene
        );
    }

    getId(): number {
        return CONVEYOR_BELT_ID;
    }

    copy(): GameObject {
        let conveyorBelt = new ConveyorBelt(
            this.gridX,
            this.gridY,
            this.scene
        );
        conveyorBelt.direction = this.direction;
        conveyorBelt.isSelected = this.isSelected;
        conveyorBelt.move(this.gridX, this.gridY);
        conveyorBelt.sprite.setRotation(Phaser.Math.DegToRad(DIRECTIONS_TO_DEG[this.direction]));
        conveyorBelt.updateVisibility();

        return conveyorBelt;
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
        const moveValue = 0.5;
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
                newY -= moveValue;
            } else if (this.direction === EAST) {
                newX += moveValue;
            } else if (this.direction === SOUTH) {
                newY += moveValue;
            } else if (this.direction === WEST) {
                newX -= moveValue;
            }

            item.moveTo(newX, newY);
        }
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

    constructor(gridX, gridY, scene) {
        super(
            gridX,
            gridY,
            scene
        );
    }

    getId(): number {
        return CONVEYOR_BELT_LEFT_ID;
    }

    copy(): GameObject {
        let conveyorBelt = new ConveyorBeltLeft(
            this.gridX,
            this.gridY,
            this.scene
        );
        conveyorBelt.direction = this.direction;
        conveyorBelt.isSelected = this.isSelected;
        conveyorBelt.move(this.gridX, this.gridY);
        conveyorBelt.sprite.setRotation(Phaser.Math.DegToRad(DIRECTIONS_TO_DEG[this.direction]));
        conveyorBelt.updateVisibility();

        return conveyorBelt;
    }


    updateDetectionZones() {
        updateTurnedConveyorBeltDetectionZone(this.initialDetectionZone, this.direction, this.gridX, this.gridY);
        updateTurnedConveyorBeltDetectionZone(this.turnDetectionZone, (this.direction+1)%4, this.gridX, this.gridY);
    }

    getDetectionZones(): Phaser.Geom.Rectangle[] {
        return [this.initialDetectionZone, this.turnDetectionZone];
    }

    update(items) {
        const moveValue = 0.5;
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
                    newY -= moveValue;
                } else if (this.direction === EAST) {
                    newX += moveValue;
                } else if (this.direction === SOUTH) {
                    newY += moveValue;
                } else if (this.direction === WEST) {
                    newX -= moveValue;
                }
            }

            if (overlapsTurnDetectionZone) {
                if (secondDirection === NORTH) {
                    newY -= moveValue;
                } else if (secondDirection === EAST) {
                    newX += moveValue;
                } else if (secondDirection === SOUTH) {
                    newY += moveValue;
                } else if (secondDirection === WEST) {
                    newX -= moveValue;
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

    constructor(gridX, gridY, scene) {
        super(
            gridX,
            gridY,
            scene
        );
    }

    getId(): number {
        return CONVEYOR_BELT_RIGHT_ID;
    }

    copy(): GameObject {
        let conveyorBelt = new ConveyorBeltRight(
            this.gridX,
            this.gridY,
            this.scene
        );
        conveyorBelt.direction = this.direction;
        conveyorBelt.isSelected = this.isSelected;
        conveyorBelt.move(this.gridX, this.gridY);
        conveyorBelt.sprite.setRotation(Phaser.Math.DegToRad(DIRECTIONS_TO_DEG[this.direction]));
        conveyorBelt.updateVisibility();

        return conveyorBelt;
    }


    updateDetectionZones() {
        updateTurnedConveyorBeltDetectionZone(this.initialDetectionZone, this.direction, this.gridX, this.gridY);
        updateTurnedConveyorBeltDetectionZone(this.turnDetectionZone, (this.direction+3)%4, this.gridX, this.gridY);
    }

    getDetectionZones(): Phaser.Geom.Rectangle[] {
        return [this.initialDetectionZone, this.turnDetectionZone];
    }

    update(items) {
        const moveValue = 0.5;
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
                    newY -= moveValue;
                } else if (this.direction === EAST) {
                    newX += moveValue;
                } else if (this.direction === SOUTH) {
                    newY += moveValue;
                } else if (this.direction === WEST) {
                    newX -= moveValue;
                }
            }

            if (overlapsTurnDetectionZone) {
                if (secondDirection === NORTH) {
                    newY -= moveValue;
                } else if (secondDirection === EAST) {
                    newX += moveValue;
                } else if (secondDirection === SOUTH) {
                    newY += moveValue;
                } else if (secondDirection === WEST) {
                    newX -= moveValue;
                }
            }

            item.moveTo(newX, newY);
        }
    }
}

function shouldConveyorBeltMoveItem(item: GameItem, items: GameItem[], direction: number): boolean {
    for (let i = 0; i < items.length; i++) {
        const currentItem = items[i];
        if (currentItem === item) {
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
    gridY: number
) {
    const detectionZoneSize = TILE_SIZE / 2;
    const detectionZoneLength = TILE_SIZE / 10;

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
    metaData: LogProducerMetaData;
    detectionZone: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(
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
                {gridX: 0, gridY: -1},
                {gridX: 0, gridY: 0},
                {gridX: 0, gridY: 1},
            ]
        );
        this.lastProducedTimestampInMs = new Date().getTime();
        this.metaData = getGameObjectById(this.getId()).metaData as LogProducerMetaData;
    }

    updateDetectionZones() {
        this.detectionZone.width = TILE_SIZE;
        this.detectionZone.height = TILE_SIZE;
        this.detectionZone.x = this.gridX * TILE_SIZE + TILE_SIZE * 0.8;
        this.detectionZone.y = this.gridY * TILE_SIZE;
    }

    getDetectionZones(): Phaser.Geom.Rectangle[] {
        return [this.detectionZone];
    }

    getId(): number {
        return LOG_PRODUCER_ID;
    }

    copy(): GameObject {
        let logProducer = new LogProducer(
            this.gridX,
            this.gridY,
            this.scene
        );
        logProducer.isSelected = this.isSelected;
        logProducer.move(this.gridX, this.gridY);
        logProducer.updateVisibility();

        return logProducer;
    }

    rotate() {
    }

    update(items: GameItem[]) {
        const currentTime = new Date().getTime();
        if (currentTime - this.lastProducedTimestampInMs < this.metaData.productionTimeMs) {
            return;
        }

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
    }

    canBePlaced(): boolean {
        if (this.gridX !== 0) {
            return false;
        }

        return super.canBePlaced();
    }
}

type LogProducerMetaData = { productionTimeMs: number };
