import {SPRITE_FRAME_SIZE} from "./properties.js";

const DARK_WATER_COLOR = 0x5c699f;
const GRASS_COLOR = 0x8b9150;

const BUBBLE_1_TILE = 32 * 14 + 3;
const BUBBLE_2_TILE = 32 * 14 + 5;
const WATER_TILE = 32 * 12 + 7;
const WAVES_1_TILE = 32 * 17 + 21;
const WAVES_2_TILE = 32 * 17 + 22;
const WAVES_3_TILE = 32 * 17 + 23;

const RIVER_EDGE_TILE = 32 * 13 + 7;

const GRASS_1_TILE = 32 * 25;
const GRASS_2_TILE = 32 * 5 + 21;
const GRASS_3_TILE = 32 * 5 + 22;
const GRASS_4_TILE = 32 * 5 + 23;

const TREE_1_1_TILE = 32 * 15 + 24;
const TREE_1_2_TILE = 32 * 15 + 25;
const TREE_1_3_TILE = 32 * 15 + 26;
const TREE_2_1_TILE = 32 * 16 + 23;
const TREE_2_2_TILE = 32 * 16 + 24;
const TREE_2_3_TILE = 32 * 16 + 25;
const TREE_2_4_TILE = 32 * 16 + 26;
const TREE_3_1_TILE = 32 * 17 + 23;
const TREE_3_2_TILE = 32 * 17 + 24;
const TREE_3_3_TILE = 32 * 17 + 25;
const TREE_3_4_TILE = 32 * 17 + 26;


export const paintTerrain = (scene, tileSize, gridWidth, gridHeight) => {
    paintRiver(scene, tileSize, gridWidth);
    paintGrass(scene, tileSize, gridHeight, gridWidth);
    paintForest(scene, tileSize, gridHeight);
}

const paintRiver = (scene, tileSize, gridWidth) => {
    const pixelSize = tileSize / 8;

    const riverGraphics = scene.add.graphics();
    riverGraphics.fillStyle(GRASS_COLOR, 1);
    riverGraphics.fillRect(-tileSize, -tileSize, (tileSize + 1) * gridWidth, pixelSize);

    riverGraphics.fillStyle(DARK_WATER_COLOR, 1);
    riverGraphics.fillRect(-tileSize, -tileSize + pixelSize, (tileSize + 1) * gridWidth, pixelSize * 6);

    riverGraphics.fillStyle(GRASS_COLOR, 1);
    riverGraphics.fillRect(-tileSize, -pixelSize, (tileSize + 1) * gridWidth, pixelSize);

    const waterTiles = [
        BUBBLE_1_TILE,
        BUBBLE_2_TILE,
        WAVES_1_TILE,
        WAVES_2_TILE,
        WAVES_3_TILE
    ];
    for (let x = -tileSize; x < tileSize * gridWidth; x += SPRITE_FRAME_SIZE) {
        let waterTile = WATER_TILE;
        if (Math.random() > 0.80) {
            waterTile = chooseRandomFromArray(waterTiles);
        }
        scene.add.sprite(x, -tileSize, 'terrain', waterTile).setOrigin(0, 0);
        scene.add.sprite(x, -SPRITE_FRAME_SIZE, 'terrain', RIVER_EDGE_TILE).setOrigin(0, 0);
    }
}

const paintGrass = (scene, tileSize, gridHeight, gridWidth) => {
    const grassTiles = [
        GRASS_1_TILE,
        GRASS_2_TILE,
        GRASS_3_TILE,
        GRASS_4_TILE
    ]

    for (let row = 0; row < gridHeight; row++) {
        for (let col = 0; col < gridWidth; col++) {
            scene.add.sprite(col*tileSize, row*tileSize, 'terrain', chooseRandomFromArray(grassTiles)).setOrigin(0, 0);
            scene.add.sprite(col*tileSize+SPRITE_FRAME_SIZE, row*tileSize, 'terrain', chooseRandomFromArray(grassTiles)).setOrigin(0, 0);
            scene.add.sprite(col*tileSize+SPRITE_FRAME_SIZE, row*tileSize+SPRITE_FRAME_SIZE, 'terrain', chooseRandomFromArray(grassTiles)).setOrigin(0, 0);
            scene.add.sprite(col*tileSize, row*tileSize+SPRITE_FRAME_SIZE, 'terrain', chooseRandomFromArray(grassTiles)).setOrigin(0, 0);
        }
    }

    const graphics = scene.add.graphics();
    const lineWidth = 1.5;
    graphics.lineStyle(lineWidth, 0x22662a, 1);
    for (let row = 0; row < gridHeight; row++) {
        for (let col = 0; col < gridWidth; col++) {
            graphics.strokeRect(
                col * tileSize,
                row * tileSize,
                tileSize,
                tileSize
            );
        }
    }
}

const paintForest = (scene, tileSize, gridHeight) => {
    const grassTiles = [
        GRASS_1_TILE,
        GRASS_2_TILE,
        GRASS_3_TILE,
        GRASS_4_TILE
    ]
    scene.add.sprite(-tileSize, 0, 'terrain', chooseRandomFromArray(grassTiles)).setOrigin(0, 0);
    for (let row = 0; row < gridHeight; row++) {
        scene.add.sprite(-tileSize+SPRITE_FRAME_SIZE, row*tileSize, 'terrain', chooseRandomFromArray(grassTiles)).setOrigin(0, 0);
        scene.add.sprite(-tileSize+SPRITE_FRAME_SIZE, row*tileSize+SPRITE_FRAME_SIZE, 'terrain', chooseRandomFromArray(grassTiles)).setOrigin(0, 0);
    }

    for (let row = 0; row < gridHeight; row++) {
        scene.add.sprite(-tileSize, row*tileSize, 'terrain', TREE_1_2_TILE).setOrigin(0, 0);
        scene.add.sprite(-tileSize+SPRITE_FRAME_SIZE, row*tileSize, 'terrain', TREE_1_3_TILE).setOrigin(0, 0);

        scene.add.sprite(-tileSize, row*tileSize + SPRITE_FRAME_SIZE, 'terrain', TREE_2_3_TILE).setOrigin(0, 0);
        scene.add.sprite(-tileSize+SPRITE_FRAME_SIZE, row*tileSize + SPRITE_FRAME_SIZE, 'terrain', TREE_2_4_TILE).setOrigin(0, 0);

        if (row < gridHeight - 1) {
            scene.add.sprite(-tileSize, row*tileSize+SPRITE_FRAME_SIZE*2, 'terrain', TREE_3_3_TILE).setOrigin(0, 0);
            scene.add.sprite(-tileSize+SPRITE_FRAME_SIZE, row*tileSize + SPRITE_FRAME_SIZE*2, 'terrain', TREE_3_4_TILE).setOrigin(0, 0);
        }


        scene.add.sprite(-tileSize, row*tileSize-SPRITE_FRAME_SIZE, 'terrain', TREE_1_3_TILE).setOrigin(0, 0);
        scene.add.sprite(-tileSize, row*tileSize, 'terrain', TREE_2_4_TILE).setOrigin(0, 0);
        scene.add.sprite(-tileSize, row*tileSize + SPRITE_FRAME_SIZE, 'terrain', TREE_3_4_TILE).setOrigin(0, 0);
    }
}

const chooseRandomFromArray = (array) => {
    return array[Math.floor(Math.random() * array.length)];
}