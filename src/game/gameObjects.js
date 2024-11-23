import {CONVEYOR_BELT_ID, GRID_HEIGHT, GRID_WIDTH, TILE_SIZE} from "./properties.js";

const NORTH = 0;
const EAST = 1;
const SOUTH = 2;
const WEST = 3;

const CANNOT_BE_PLACED_COLOR = 0xff0000;
const CAN_BE_PLACED_COLOR = 0x00ff00;


export function getPrice(id) {
    switch (id) {
        case CONVEYOR_BELT_ID:
            return 100;
        default:
            return 0;
    }
}

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
        this.direction = EAST;
        this.isSelected = false;
    }

    paint() {
        this.graphics.clear();

        const tileSize = TILE_SIZE;
        const margin = tileSize * 0.2;

        if (this.gridX < 0 || this.gridY < 0 || this.gridX >= GRID_WIDTH || this.gridY >= GRID_HEIGHT) {
            return;
        }

        let x;
        let y;
        let width;
        let height;
        if (this.direction === NORTH || this.direction === SOUTH) {
            x = this.gridX * tileSize + (margin / 2);
            y = this.gridY * tileSize;
            width = tileSize - margin;
            height = tileSize;
        } else {
            x = this.gridX * tileSize;
            y = this.gridY * tileSize + (margin / 2);
            width = tileSize;
            height = tileSize - margin;
        }

        this.graphics.fillStyle(0x2b4454, 1);
        this.graphics.fillRect(x, y, width, height);

        const triangleMargin = tileSize * 0.2;
        this.graphics.fillStyle(0x1b2b36, 1);
        if (this.direction === NORTH) {
            this.graphics.fillTriangle(
                this.gridX * tileSize + (margin / 2) + triangleMargin,
                (this.gridY + 1) * tileSize - triangleMargin,

                (this.gridX + 1) * tileSize - (margin / 2) - triangleMargin,
                (this.gridY + 1) * tileSize - triangleMargin,

                (this.gridX + 0.5) * tileSize,
                this.gridY * tileSize + triangleMargin
            );
        }
        else if (this.direction === EAST) {
            this.graphics.fillTriangle(
                this.gridX * tileSize + triangleMargin,
                this.gridY * tileSize + (margin / 2) + triangleMargin,

                this.gridX * tileSize + triangleMargin,
                (this.gridY + 1) * tileSize - (margin / 2) - triangleMargin,

                (this.gridX + 1) * tileSize - triangleMargin,
                (this.gridY + 0.5) * tileSize
            );
        } else if (this.direction === SOUTH) {
            this.graphics.fillTriangle(
                this.gridX * tileSize + (margin / 2) + triangleMargin,
                this.gridY * tileSize + triangleMargin,

                (this.gridX + 1) * tileSize - (margin / 2) - triangleMargin,
                this.gridY * tileSize + triangleMargin,

                (this.gridX + 0.5) * tileSize,
                (this.gridY + 1) * tileSize - triangleMargin
            );
        } else if (this.direction === WEST) {
            this.graphics.fillTriangle(
                (this.gridX + 1) * tileSize - triangleMargin,
                this.gridY * tileSize + (margin / 2) + triangleMargin,

                (this.gridX + 1) * tileSize - triangleMargin,
                (this.gridY + 1) * tileSize - (margin / 2) - triangleMargin,

                this.gridX * tileSize + triangleMargin,
                (this.gridY + 0.5) * tileSize
            );
        }

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
    }

    rotate() {
        this.direction = (this.direction + 1) % 4;
    }

    setSelected(selected) {
        this.isSelected = selected;
    }
}