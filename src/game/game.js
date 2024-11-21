import {Game, AUTO, Scale, Scene} from "phaser";

class MainScene extends Scene {
    constructor() {
        super({key: 'MainScene'})
    }

    create() {
        const tileSize = 100;
        const gridWidth = 20;
        const gridHeight = 20;

        const graphics = this.add.graphics();

        for (let row = 0; row < gridHeight; row++) {
            const col = -1;
            const color = (row + col) % 2 === 0 ? 0x005500 : 0x003300;
            graphics.fillStyle(color, 1);
            graphics.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
        }

        for (let col = -1; col < gridWidth; col++) {
            const row = -1;
            const color = (row + col) % 2 === 0 ? 0x000055 : 0x000033;
            graphics.fillStyle(color, 1);
            graphics.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
        }

        for (let row = 0; row < gridHeight; row++) {
            for (let col = 0; col < gridWidth; col++) {
                const color = (row + col) % 2 === 0 ? 0x555555 : 0x333333;
                graphics.fillStyle(color, 1);
                graphics.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
            }
        }

        const worldWidth = gridWidth * tileSize;
        const worldHeight = (gridHeight + 1) * (tileSize + 1);
        this.cameras.main.setBounds(-tileSize, -tileSize, worldWidth, worldHeight);

        this.cameras.main.scrollX = -tileSize*0.5;
        this.cameras.main.scrollY = -tileSize;

        this.isDragging = false;
        this.dragStart = {x: 0, y: 0};

        this.input.on('pointerdown', (pointer) => {
            this.isDragging = true;
            this.dragStart.x = pointer.x + this.cameras.main.scrollX;
            this.dragStart.y = pointer.y + this.cameras.main.scrollY;
        });

        this.input.on('pointermove', (pointer) => {
            if (this.isDragging) {
                this.cameras.main.scrollX = this.dragStart.x - pointer.x;
                this.cameras.main.scrollY = this.dragStart.y - pointer.y;
            }
        });

        this.input.on('pointerup', () => {
            this.isDragging = false;
        });

        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            const zoomChange = deltaY * -0.001;
            this.cameras.main.zoom += zoomChange;
            this.cameras.main.zoom = Phaser.Math.Clamp(this.cameras.main.zoom, 0.5, 3);
        });
    }


    update() {
    }
}

export function launch() {
    return new Game({
        type: AUTO,
        scale: {
            mode: Scale.RESIZE,
            width: window.innerWidth * window.devicePixelRatio,
            autoCenter: Scale.CENTER_BOTH,
            height: window.innerHeight * window.devicePixelRatio,
        },
        parent: "game",
        backgroundColor: "#201726",
        physics: {
            default: "arcade",
        },
        scene: MainScene,
    });
}