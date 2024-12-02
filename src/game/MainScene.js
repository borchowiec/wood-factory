import {Scene} from "phaser";
import {
    GRID_HEIGHT,
    GRID_WIDTH,
    LONG_PRESS_DURATION_MS,
    SELL_PRICE,
    SPRITE_FRAME_SIZE,
    TILE_SIZE
} from "./properties.js";
import {paintTerrain} from "./terrainPainter.js";
import {getGameObjectById} from "../common/GameObjectData";
import {createObject} from "./gameObjects.js";
import {LogItem} from "./gameItems.ts";

function getSuccessResponse() {
    return {success: true};
}

function getErrorResponse(message) {
    return {success: false, message: message};
}

export class MainScene extends Scene {
    constructor() {
        super({key: 'MainScene'})

        this.grid = null;
        this.money = null;
        this.newPlacableObject = null;
        this.movingObject = null;
        this.tempExistingObject = null;
        this.selectedObject = null;
        this.longPressTimer = null;
        this.items = null;

        this.setMoney(10000);
    }

    preload() {
        this.load.spritesheet('terrain',
            'assets/terrain_atlas.png',
            {frameWidth: SPRITE_FRAME_SIZE, frameHeight: SPRITE_FRAME_SIZE}
        );

        this.load.spritesheet('conveyorBelt', 'assets/objects/conveyor-belt/sprite.png', {
            frameWidth: 64,
            frameHeight: 64
        });
    }

    create() {
        const tileSize = TILE_SIZE;
        const gridWidth = GRID_WIDTH;
        const gridHeight = GRID_HEIGHT;

        this.initializeCamera(tileSize, gridWidth, gridHeight);
        paintTerrain(this, tileSize, gridWidth, gridHeight);

        this.initializeGrid(gridWidth, gridHeight);

        this.items = [];
        this.items.push(new LogItem(100, 100, this));
        this.items.push(new LogItem(200, 110, this));
        this.items.push(new LogItem(300, 120, this));
        this.items.push(new LogItem(400, 130, this));
        this.items.forEach(item => item.paint());

        this.newPlacableObject = null;
        this.anims.create({
            key: 'conveyorBeltAnim',
            frames: this.anims.generateFrameNumbers('conveyorBelt', {frames: [0, 1, 2, 3]}),
            frameRate: 10,
            repeat: -1
        });
    }

    initializeCamera(tileSize, gridWidth, gridHeight) {
        const worldWidth = gridWidth * tileSize;
        const worldHeight = (gridHeight + 1) * (tileSize + 1);
        this.cameras.main.setBounds(-tileSize, -tileSize, worldWidth, worldHeight);

        this.cameras.main.scrollX = -tileSize * 0.5;
        this.cameras.main.scrollY = -tileSize;

        this.isDragging = false;
        this.dragStart = {x: 0, y: 0};

        this.input.on('pointerdown', (pointer) => {
            this.isDragging = true;
            this.dragStart.x = pointer.x + this.cameras.main.scrollX;
            this.dragStart.y = pointer.y + this.cameras.main.scrollY;

            this.longPressTimer = this.time.delayedCall(
                LONG_PRESS_DURATION_MS,
                () => this.handleLongPress(pointer),
                null,
                this
            );

            const tileX = Math.floor(pointer.worldX / TILE_SIZE);
            const tileY = Math.floor(pointer.worldY / TILE_SIZE);

            if (this.newPlacableObject) {
                this.tryToSelectNewPlaceForObject(this.newPlacableObject, tileX, tileY);
            } else if (this.movingObject) {
                this.tryToSelectNewPlaceForObject(this.movingObject, tileX, tileY);
            }
        });

        this.input.on('pointermove', (pointer) => {
            if (this.isDragging) {
                this.cameras.main.scrollX = this.dragStart.x - pointer.x;
                this.cameras.main.scrollY = this.dragStart.y - pointer.y;
            }
        });

        this.input.on('pointerup', () => {
            this.isDragging = false;
            if (this.longPressTimer) {
                this.longPressTimer.remove(false); // Cancel the timer
                this.longPressTimer = null;
            }
        });

        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            const zoomChange = deltaY * -0.001;
            this.cameras.main.zoom += zoomChange;
            this.cameras.main.zoom = Phaser.Math.Clamp(this.cameras.main.zoom, 0.7, 3);
        });
    }

    tryToSelectNewPlaceForObject(object, tileX, tileY) {
        if (tileX < 0 || tileX >= GRID_WIDTH || tileY < 0 || tileY >= GRID_HEIGHT) {
            return;
        }
        if (object.gridX === tileX && object.gridY === tileY) {
            return;
        }

        object.gridX = tileX;
        object.gridY = tileY;
        object.paint();
    }

    handleLongPress(pointer) {
        if (this.newPlacableObject || this.movingObject || this.selectedObject) {
            return;
        }

        const tileX = Math.floor(pointer.worldX / TILE_SIZE);
        const tileY = Math.floor(pointer.worldY / TILE_SIZE);

        if (tileX < 0 || tileX >= GRID_WIDTH || tileY < 0 || tileY >= GRID_HEIGHT) {
            return;
        }
        if (!this.grid[tileX][tileY]) {
            return;
        }

        this.selectedObject = this.grid[tileX][tileY];
        this.selectedObject.setSelected(true);
        this.selectedObject.paint();
        const movingExistingObjectEvent = new CustomEvent("movingExistingObject", {
            detail: {}
        });
        window.dispatchEvent(movingExistingObjectEvent);
    }

    initializeGrid(gridWidth, gridHeight) {
        this.grid = Array.from({length: gridWidth}, () => Array(gridHeight).fill(null));
    }

    update() {
        this.grid.forEach(row => {
            row.forEach(object => {
                if (object) {
                    object.update(this.items);
                }
            })
        })
    }

    setNewPotentialObject(id) {
        if (getGameObjectById(id).price > this.money) {
            return getErrorResponse("Not enough money");
        }

        this.newPlacableObject = createObject(id, this);
        return getSuccessResponse();
    }

    cancelPlacingNewObject() {
        this.newPlacableObject.clear();
        this.newPlacableObject = null;
        return getSuccessResponse();
    }

    acceptNewObject() {
        if (!this.newPlacableObject) {
            return getErrorResponse("No object to place");
        }

        const price = getGameObjectById(this.newPlacableObject.id).price;
        if (price > this.money) {
            return getErrorResponse("Not enough money");
        }

        if (!this.newPlacableObject.canBePlaced()) {
            return getErrorResponse("Cannot place the object here");
        }

        this.grid[this.newPlacableObject.gridX][this.newPlacableObject.gridY] = this.newPlacableObject;
        this.newPlacableObject.paint();
        this.newPlacableObject = null;

        this.setMoney(this.money - price);

        return getSuccessResponse();
    }

    setMoney(money) {
        this.money = money;
        const moneyUpdateEvent = new CustomEvent("moneyUpdate", {
            detail: {money: this.money}
        });

        window.dispatchEvent(moneyUpdateEvent);
    }

    rotateNewObject() {
        if (this.newPlacableObject) {
            this.newPlacableObject.rotate();
            this.newPlacableObject.paint();
        }
    }

    cancelSelection() {
        if (this.selectedObject) {
            this.selectedObject.setSelected(false);
            this.selectedObject.paint();
            this.selectedObject = null;
        }
    }

    sellSelection() {
        if (this.selectedObject) {
            const price = Math.ceil(getGameObjectById(this.selectedObject.id).price * SELL_PRICE);

            this.selectedObject.clear();
            this.grid[this.selectedObject.gridX][this.selectedObject.gridY] = null;
            this.selectedObject = null;

            this.setMoney(this.money + price);
        }
    }

    moveSelectedObject() {
        if (this.selectedObject) {
            this.selectedObject.setSelected(false);
            this.tempExistingObject = this.selectedObject;
            this.movingObject = Object.assign(Object.create(Object.getPrototypeOf(this.selectedObject)), this.selectedObject);
            this.selectedObject = null;

            this.grid[this.tempExistingObject.gridX][this.tempExistingObject.gridY] = null;

            this.tempExistingObject.clear();
            this.movingObject.clear();
            this.movingObject.paint();
        }
    }

    rotateMovingObject() {
        if (this.movingObject) {
            this.movingObject.rotate();
            this.movingObject.paint();
        }
    }

    cancelMovingObject() {
        if (this.movingObject) {
            this.movingObject.clear();
            this.movingObject = null;

            this.grid[this.tempExistingObject.gridX][this.tempExistingObject.gridY] = this.tempExistingObject;
            this.tempExistingObject.paint();
            this.tempExistingObject = null;
        }
    }

    acceptMovingObject() {
        if (!this.movingObject) {
            return getErrorResponse("No object to move");
        }

        if (!this.movingObject.canBePlaced()) {
            return getErrorResponse("Cannot place the object here");
        }

        this.grid[this.movingObject.gridX][this.movingObject.gridY] = this.movingObject;
        this.movingObject.paint();
        this.movingObject = null;
        this.tempExistingObject = null;

        return getSuccessResponse();
    }

    zoomOut() {
        this.zoom(-0.4);
    }

    zoomIn() {
        this.zoom(0.4);
    }

    zoom(zoomChange) {
        this.cameras.main.zoom += zoomChange;
        this.cameras.main.zoom = Phaser.Math.Clamp(this.cameras.main.zoom, 0.7, 3);
    }
}