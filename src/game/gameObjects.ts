import {
    DEBUG,
    DEBUG_DEPTH,
    GRID_HEIGHT,
    GRID_WIDTH,
    OBJECT_DEPTH,
    OBJECT_SELECTION_DEPTH,
    TILE_SIZE
} from "./properties.js";
import {CONVEYOR_BELT_ID} from "../common/GameObjectData.ts";
import {GameItem} from "./gameItems";
import * as Phaser from "phaser";
import * as Phaser from "phaser";
import * as Phaser from "phaser";
import * as Phaser from "phaser";
import * as Phaser from "phaser";
import {i, j} from "vite/dist/node/types.d-aGj9QkWt";
import * as Phaser from "phaser";
import {grid} from "ionicons/icons";
import {isVisible} from "@testing-library/user-event/utils/misc/isVisible";

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
            return new ConveyorBelt(-1, -1, scene);
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

    abstract copy(): GameObject;
}

class ConveyorBelt extends GameObject {
    gridX: number;
    gridY: number;
    scene: Phaser.Scene;

    selectionGraphics: Phaser.GameObjects.Graphics;
    debugGraphics: Phaser.GameObjects.Graphics;
    incorrectPlacementGraphics: Phaser.GameObjects.Graphics;
    correctPlacementGraphics: Phaser.GameObjects.Graphics;
    sprite: Phaser.GameObjects.Sprite;

    direction: number;
    detectionZone: Phaser.Geom.Rectangle;
    isSelected: boolean;
    isVisible: boolean;

    constructor(gridX, gridY, scene) {
        super();

        this.gridX = gridX;
        this.gridY = gridY;
        this.scene = scene;
        this.isVisible = true;

        this.sprite = this.scene.add.sprite(
            this.gridX * TILE_SIZE + TILE_SIZE / 2,
            this.gridY * TILE_SIZE + TILE_SIZE / 2,
            "conveyorBelt"
        );
        this.sprite.setDepth(OBJECT_DEPTH);
        this.sprite.play("conveyorBeltAnim", true);

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
        this.incorrectPlacementGraphics.fillStyle(CANNOT_BE_PLACED_COLOR, 0.2);
        this.incorrectPlacementGraphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        this.incorrectPlacementGraphics.setDepth(OBJECT_SELECTION_DEPTH);
        this.incorrectPlacementGraphics.x = this.gridX * TILE_SIZE;
        this.incorrectPlacementGraphics.y = this.gridY * TILE_SIZE;

        this.correctPlacementGraphics = scene.add.graphics();
        this.correctPlacementGraphics.fillStyle(CAN_BE_PLACED_COLOR, 0.2);
        this.correctPlacementGraphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        this.correctPlacementGraphics.setDepth(OBJECT_SELECTION_DEPTH);
        this.correctPlacementGraphics.x = this.gridX * TILE_SIZE;
        this.correctPlacementGraphics.y = this.gridY * TILE_SIZE;

        this.direction = EAST;
        this.isSelected = false;

        this.detectionZone = new Phaser.Geom.Rectangle(
            0,
            0,
            0,
            0
        );
        this.updateDetectionZone();

        this.debugGraphics = scene.add.graphics();
        this.repaintDebug();
        this.updatePainting();
    }

    getId(): number {
        return CONVEYOR_BELT_ID;
    }

    updatePainting() {
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
        this.updatePainting();
    }

    canBePlaced() {
        if (this.gridX < 0 || this.gridX >= GRID_WIDTH || this.gridY < 0 || this.gridY >= GRID_HEIGHT) {
            return false;
        }
        if (this.scene.grid[this.gridX][this.gridY]) {
            return false;
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
        this.sprite.setRotation(Phaser.Math.DegToRad(DIRECTIONS_TO_DEG[this.direction]));
        this.updateDetectionZone();
        this.repaintDebug();
    }

    setSelected(selected) {
        this.isSelected = selected;
        this.updatePainting();
    }

    update(items) {
        const moveValue = 0.5;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            let detectionZones = item.getDetectionZones();
            for (let j = 0; j < detectionZones.length; j++) {
                const detectionZone = detectionZones[j];
                if (!Phaser.Geom.Rectangle.Overlaps(detectionZone, this.detectionZone)) {
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
                break;
            }
        }
    }

    move(gridX: number, gridY: number): void {
        this.gridX = gridX;
        this.gridY = gridY;

        const x = this.gridX * TILE_SIZE;
        const y = this.gridY * TILE_SIZE;

        this.updateDetectionZone();

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

    updateDetectionZone() {
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

    setVisible(isVisible: boolean): void {
        this.isVisible = isVisible;
        this.updatePainting();
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
        conveyorBelt.updatePainting();

        return conveyorBelt;
    }

    repaintDebug() {
        this.debugGraphics.clear();
        this.debugGraphics.setDepth(DEBUG_DEPTH);
        this.debugGraphics.lineStyle(1, 0xff00ff, 1);
        this.debugGraphics.strokeRect(
            this.detectionZone.x,
            this.detectionZone.y,
            this.detectionZone.width,
            this.detectionZone.height
        );
        this.updatePainting();
    }
}