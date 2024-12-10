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
import {gameObjects, getGameObjectById} from "../common/GameObjectData";
import {createObject} from "./gameObjects.ts";
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

        this.setMoney(100000);
    }

    preload() {
        this.load.spritesheet('terrain',
            'assets/terrain_atlas.png',
            {frameWidth: SPRITE_FRAME_SIZE, frameHeight: SPRITE_FRAME_SIZE}
        );

        gameObjects.forEach(gameObject => {
            this.load.spritesheet(gameObject.imageData.spriteName, gameObject.imageData.spritePath, {
                frameWidth: gameObject.imageData.spriteFrameWidth,
                frameHeight: gameObject.imageData.spriteFrameHeight
            });
        });

        this.load.spritesheet('conveyorBelt', 'assets/objects/conveyor-belt/sprite.png', {
            frameWidth: 64,
            frameHeight: 64
        });

        this.load.image('log', 'assets/items/log.png');
    }

    create() {
        const tileSize = TILE_SIZE;
        const gridWidth = GRID_WIDTH;
        const gridHeight = GRID_HEIGHT;

        this.initializeCamera(tileSize, gridWidth, gridHeight);
        paintTerrain(this, tileSize, gridWidth, gridHeight);

        this.initializeGrid(gridWidth, gridHeight);

        this.items = [];

        this.newPlacableObject = null;
        gameObjects.forEach(gameObject => {
            this.anims.create({
                key: gameObject.imageData.spriteAnimationName,
                frames: this.anims.generateFrameNumbers(
                    gameObject.imageData.spriteName,
                    {frames: gameObject.imageData.spriteAnimationFrames}),
                frameRate: gameObject.imageData.spriteAnimationRate,
                repeat: -1
            });
        })
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
                this.longPressTimer.remove(false);
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

        object.move(tileX, tileY);
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
        for (let gridX = 0; gridX < GRID_WIDTH; gridX++) {
            for (let gridY = 0; gridY < GRID_HEIGHT; gridY++) {
                let gridObject = this.grid[gridX][gridY];
                if (gridObject && gridObject.gridX === gridX && gridObject.gridY === gridY) {
                    gridObject.update(this.items);
                }
            }
        }

        const riverSpeed = 1;
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            if (item.getY() >= 0) {
                continue;
            }

            let newY = item.getY();
            let newX = item.getX();
            if (item.getY() > -TILE_SIZE) {
                newY -= riverSpeed;
            }
            if (item.getY() < -TILE_SIZE * 0.8) {
                newX -= riverSpeed;
            }
            item.moveTo(newX, newY);

            if (item.getX() < -TILE_SIZE*2) {
                this.items.splice(i, 1);
                item.clear();
                this.setMoney(this.money + item.getPrice());
            }
        }
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

        const price = getGameObjectById(this.newPlacableObject.getId()).price;
        if (price > this.money) {
            return getErrorResponse("Not enough money");
        }

        if (!this.newPlacableObject.canBePlaced()) {
            return getErrorResponse("Cannot place the object here");
        }

        this.newPlacableObject.placeOnGrid();
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
            const price = Math.ceil(getGameObjectById(this.selectedObject.getId()).price * SELL_PRICE);

            this.selectedObject.removeFromGrid();
            this.selectedObject.clear();
            this.selectedObject = null;

            this.setMoney(this.money + price);
        }
    }

    moveSelectedObject() {
        if (this.selectedObject) {
            this.selectedObject.setSelected(false);
            this.tempExistingObject = this.selectedObject;
            this.movingObject = this.selectedObject.copy();
            this.selectedObject = null;

            this.tempExistingObject.removeFromGrid();
            this.tempExistingObject.setVisible(false);
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

            this.tempExistingObject.placeOnGrid();
            this.tempExistingObject.setVisible(true);
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

        this.movingObject.placeOnGrid();
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