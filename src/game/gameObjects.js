import {DEBUG, GRID_HEIGHT, GRID_WIDTH, TILE_SIZE} from "./properties.js";
import {CONVEYOR_BELT_ID} from "../common/GameObjectData.ts";

const NORTH = 0;
const EAST = 1;
const SOUTH = 2;
const WEST = 3;

const DIRECTIONS_TO_DEG = [270, 0, 90, 180];

const CANNOT_BE_PLACED_COLOR = 0xff0000;
const CAN_BE_PLACED_COLOR = 0x00ff00;

export function createObject(id, scene) {
    switch (id) {
        case CONVEYOR_BELT_ID:
            return new ConveyorBelt(-1, -1, scene);
        default:
            return null;
    }
}

class ConveyorBelt {
    constructor(gridX, gridY, scene) {
        this.id = CONVEYOR_BELT_ID;

        this.gridX = gridX;
        this.gridY = gridY;
        this.scene = scene;
        this.graphics = scene.add.graphics();
        this.sprite = undefined;
        this.direction = EAST;
        this.isSelected = false;

        this.detectionZone = new Phaser.Geom.Rectangle(
            0,
            0,
            0,
            0
        );
        this.updateDetectionZone();
    }

    paint() {
        this.updateDetectionZone();

        if (!this.sprite) {
            this.sprite = this.scene.add.sprite(this.gridX * TILE_SIZE, this.gridY * TILE_SIZE, "conveyorBelt");
            this.sprite.play("conveyorBeltAnim", true);
        }

        this.graphics.clear();
        this.sprite.setX(this.gridX * TILE_SIZE + TILE_SIZE / 2);
        this.sprite.setY(this.gridY * TILE_SIZE + TILE_SIZE / 2);
        this.sprite.setRotation(Phaser.Math.DegToRad(DIRECTIONS_TO_DEG[this.direction]));

        const tileSize = TILE_SIZE;

        if (this.isSelected) {
            const lineWidth = 5;
            this.graphics.lineStyle(lineWidth, 0xff0000, 1);
            this.graphics.strokeRect(
                this.gridX * tileSize - lineWidth,
                this.gridY * tileSize - lineWidth,
                tileSize + 2 * lineWidth,
                tileSize + 2 * lineWidth
            );
        }

        if (DEBUG) {
            this.graphics.fillStyle(0x00ff00, 1);
            this.graphics.strokeRectShape(this.detectionZone);
        }

        if (this.scene.grid[this.gridX][this.gridY] === this) {
            return;
        }

        if (this.canBePlaced()) {
            this.graphics.fillStyle(CAN_BE_PLACED_COLOR, 0.2);
        } else {
            this.graphics.fillStyle(CANNOT_BE_PLACED_COLOR, 0.2);
        }
        this.graphics.fillRect(this.gridX * tileSize, this.gridY * tileSize, tileSize, tileSize);
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
        this.graphics.clear();

        if (this.sprite) {
            this.sprite.destroy();
            this.sprite = undefined;
        }
    }

    rotate() {
        this.direction = (this.direction + 1) % 4;
        this.updateDetectionZone();
    }

    setSelected(selected) {
        this.isSelected = selected;
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
                let newX = item.x;
                let newY = item.y;

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
}