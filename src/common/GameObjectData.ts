export type GameObjectData = {
    id: number;
    name: string;
    price: number;
    imageData: {
        icon: string;
        spriteName: string;
        spritePath: string;
        spriteFrameWidth: number;
        spriteFrameHeight: number;
        spriteAnimationName: string;
        spriteAnimationRate: number;
        spriteAnimationFrames: number[];
    },
    metaData: object;
}

export const CONVEYOR_BELT_ID = 0;
export const CONVEYOR_BELT_LEFT_ID = 1;
export const CONVEYOR_BELT_RIGHT_ID = 2;
export const LOG_PRODUCER_ID = 3;

export const gameObjects: GameObjectData[] = [
    {
        id: CONVEYOR_BELT_ID,
        name: "Conveyor Belt (Straight)",
        price: 100,
        imageData: {
            icon: "assets/objects/conveyor-belt/icon.png",
            spriteName: "conveyorBelt",
            spritePath: "assets/objects/conveyor-belt/sprite.png",
            spriteFrameWidth: 64,
            spriteFrameHeight: 64,
            spriteAnimationName: "conveyorBeltAnim",
            spriteAnimationRate: 10,
            spriteAnimationFrames: [0, 1, 2, 3],
        },
        metaData: {}
    },
    {
        id: CONVEYOR_BELT_LEFT_ID,
        name: "Conveyor Belt (Left)",
        price: 100,
        imageData: {
            icon: "assets/objects/conveyor-belt-left/icon.png",
            spriteName: "conveyorBeltLeft",
            spritePath: "assets/objects/conveyor-belt-left/sprite.png",
            spriteFrameWidth: 64,
            spriteFrameHeight: 64,
            spriteAnimationName: "conveyorBeltLeftAnim",
            spriteAnimationRate: 10,
            spriteAnimationFrames: [0, 1, 2, 3],
        },
        metaData: {}
    },
    {
        id: CONVEYOR_BELT_RIGHT_ID,
        name: "Conveyor Belt (Right)",
        price: 100,
        imageData: {
            icon: "assets/objects/conveyor-belt-right/icon.png",
            spriteName: "conveyorBeltRight",
            spritePath: "assets/objects/conveyor-belt-right/sprite.png",
            spriteFrameWidth: 64,
            spriteFrameHeight: 64,
            spriteAnimationName: "conveyorBeltRightAnim",
            spriteAnimationRate: 10,
            spriteAnimationFrames: [0, 1, 2, 3],
        },
        metaData: {}
    },
    {
        id: LOG_PRODUCER_ID,
        name: "Log Producer",
        price: 5000,
        imageData: {
            icon: "assets/objects/log-producer/icon.png",
            spriteName: "logProducer",
            spritePath: "assets/objects/log-producer/sprite.png",
            spriteFrameWidth: 64,
            spriteFrameHeight: 192,
            spriteAnimationName: "logProducerAnim",
            spriteAnimationRate: 10,
            spriteAnimationFrames: [0]
        },
        metaData: {
            productionTimeMs: 10000,
        }
    },
];

export const getGameObjectById = (id: number) => gameObjects.find((obj) => obj.id === id)