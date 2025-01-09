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
    upgrades: {price: number, details: object}[];
}

class GameObjectDataBuilder {
    private readonly id: number;
    private readonly name: string;
    private readonly prettyName: string;
    private readonly price: number;

    private iconFileName = "icon.png";
    private spriteFileName = "sprite.png";
    private spritesDirName = "";
    private spriteFrameWidth = 64;
    private spriteFrameHeight = 64;
    private spriteAnimationFrames = [0];

    private upgrades: {price: number, details: object}[] = [];

    constructor(id: number, name: string, prettyName: string, price: number) {
        this.id = id;
        this.name = name;
        this.prettyName = prettyName;
        this.price = price;

        this.spritesDirName = this.name;
    }

    withIconFileName(iconFileName: string) {
        this.iconFileName = iconFileName;
        return this;
    }

    withSpriteFileName(spriteFileName: string) {
        this.spriteFileName = spriteFileName;
        return this;
    }

    withSpritesDirName(spritesDirName: string) {
        this.spritesDirName = spritesDirName;
        return this;
    }

    withUpgrade(price: number, details: object) {
        this.upgrades.push({price, details});
        return this;
    }

    withUpgrades(upgrades: {price: number, details: object}[]) {
        this.upgrades = upgrades;
        return this;
    }

    withSpriteFrameWidth(spriteFrameWidth: number) {
        this.spriteFrameWidth = spriteFrameWidth;
        return this;
    }

    withSpriteFrameHeight(spriteFrameHeight: number) {
        this.spriteFrameHeight = spriteFrameHeight;
        return this;
    }

    withSpriteAnimationFrames(spriteAnimationFrames: number[]) {
        this.spriteAnimationFrames = spriteAnimationFrames;
        return this;
    }

    build(): GameObjectData {
        return {
            id: this.id,
            name: this.prettyName,
            price: this.price,
            imageData: {
                icon: `assets/objects/${this.spritesDirName}/${this.iconFileName}`,
                spriteName: this.name,
                spritePath: `assets/objects/${this.spritesDirName}/${this.spriteFileName}`,
                spriteFrameWidth: this.spriteFrameWidth,
                spriteFrameHeight: this.spriteFrameHeight,
                spriteAnimationName: `${this.name}Anim`,
                spriteAnimationRate: 10,
                spriteAnimationFrames: this.spriteAnimationFrames,
            },
            upgrades: this.upgrades,
        }
    }
}

export const CONVEYOR_BELT_ID = 0;
export const CONVEYOR_BELT_LEFT_ID = 1;
export const CONVEYOR_BELT_RIGHT_ID = 2;
export const LOG_PRODUCER_ID = 3;
export const SAW_MILL_ID = 4;
export const WORKSHOP_ID = 5;
export const WOODEN_NAILS_WORKSHOP_ID = 6;
export const SPLITTER_ID = 7;
export const MERGER_ID = 8;
export const STORAGE_ID = 9;
export const SORTER_ID = 10;
export const PAPER_WORKSHOP_ID = 11;
export const FABRIC_FACTORY_ID = 12;
export const SAIL_FACTORY_ID = 13;
export const CHAIR_FACTORY_ID = 14;
export const TABLE_FACTORY_ID = 15;
export const SCULPTING_WORKSHOP_ID = 16;
export const BOAT_FACTORY_ID = 17;
export const SAILBOAT_FACTORY_ID = 18;
export const SAILBOAT_WORKSHOP_ID = 19;
export const SHIP_WORKSHOP_ID = 20;

const conveyorBeltUpgrades = [
    {price: 0, details: {speed: 0.25}},
    {price: 50, details: {speed: 0.50}},
    {price: 125, details: {speed: 1}},
    {price: 200, details: {speed: 2}}
]

export const gameObjects: GameObjectData[] = [
    new GameObjectDataBuilder(CONVEYOR_BELT_ID, "conveyorBelt", "Conveyor Belt (Straight)", 100)
        .withSpriteAnimationFrames([0, 1, 2, 3])
        .withUpgrades(conveyorBeltUpgrades)
        .build(),
    new GameObjectDataBuilder(CONVEYOR_BELT_LEFT_ID, "conveyorBeltLeft", "Conveyor Belt (Left)", 100)
        .withSpriteAnimationFrames([0, 1, 2, 3])
        .withUpgrades(conveyorBeltUpgrades)
        .build(),
    new GameObjectDataBuilder(CONVEYOR_BELT_RIGHT_ID, "conveyorBeltRight", "Conveyor Belt (Right)", 100)
        .withSpriteAnimationFrames([0, 1, 2, 3])
        .withUpgrades(conveyorBeltUpgrades)
        .build(),
    new GameObjectDataBuilder(LOG_PRODUCER_ID, "logProducer", "Log Producer", 5000)
        .withSpriteFrameHeight(192)
        .withIconFileName("sprite.png")
        .withUpgrade(0, {productionTimeMs: 10000})
        .withUpgrade(2000, {productionTimeMs: 5000})
        .withUpgrade(4000, {productionTimeMs: 2500})
        .build(),
    new GameObjectDataBuilder(SAW_MILL_ID, "sawMill", "Saw Mill", 500)
        .withSpriteFrameWidth(128)
        .withSpriteAnimationFrames([0, 1, 2, 3, 4, 5, 6, 7])
        .withUpgrade(0, {productionTimeMs: 10000})
        .withUpgrade(200, {productionTimeMs: 7500})
        .withUpgrade(400, {productionTimeMs: 5000})
        .withUpgrade(600, {productionTimeMs: 2500})
        .build(),
    new GameObjectDataBuilder(WORKSHOP_ID, "workshop", "Workshop", 750)
        .withSpriteFrameWidth(128)
        .withSpriteAnimationFrames([0, 1, 2, 3, 4, 5, 6, 7])
        .withUpgrade(0, {productionTimeMs: 10000})
        .withUpgrade(300, {productionTimeMs: 7500})
        .withUpgrade(600, {productionTimeMs: 5000})
        .withUpgrade(900, {productionTimeMs: 2500})
        .build(),
    new GameObjectDataBuilder(WOODEN_NAILS_WORKSHOP_ID, "woodenNailsWorkshop", "Wooden Nails Workshop", 1200)
        .withSpriteFrameWidth(128)
        .withSpriteAnimationFrames([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23])
        .withUpgrade(0, {productionTimeMs: 10000})
        .withUpgrade(400, {productionTimeMs: 7500})
        .withUpgrade(800, {productionTimeMs: 5000})
        .withUpgrade(1200, {productionTimeMs: 2500})
        .build(),
    new GameObjectDataBuilder(SPLITTER_ID, "splitter", "Splitter", 500)
        .withSpriteFrameWidth(128)
        .withUpgrade(0, {})
        .withSpriteAnimationFrames([0, 1, 2, 3])
        .build(),
    new GameObjectDataBuilder(MERGER_ID, "merger", "Merger", 500)
        .withSpriteFrameWidth(128)
        .withSpriteFrameHeight(128)
        .withSpriteAnimationFrames([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
        .withUpgrade(0, {})
        .build(),
    new GameObjectDataBuilder(STORAGE_ID, "storage", "Storage", 1500)
        .withIconFileName("sprite.png")
        .withSpriteFrameWidth(128)
        .withSpriteFrameHeight(128)
        .withUpgrade(0, {capacity: 15})
        .withUpgrade(1000, {capacity: 30})
        .withUpgrade(2000, {capacity: 60})
        .build(),
    new GameObjectDataBuilder(SORTER_ID, "sorter", "Sorter", 1500)
        .withIconFileName("sprite.png")
        .withSpriteFrameWidth(128)
        .withSpriteFrameHeight(128)
        .withUpgrade(0, {})
        .build(),

    new GameObjectDataBuilder(PAPER_WORKSHOP_ID, "paperWorkshop", "Paper Workshop", 1800)
        .withIconFileName("sprite.png")
        .withSpriteFrameWidth(128)
        .withUpgrade(0, {productionTimeMs: 15000})
        .withUpgrade(400, {productionTimeMs: 10000})
        .withUpgrade(800, {productionTimeMs: 7500})
        .withUpgrade(1200, {productionTimeMs: 5000})
        .build(),
    new GameObjectDataBuilder(FABRIC_FACTORY_ID, "fabricFactory", "Fabric Factory", 2500)
        .withIconFileName("sprite.png")
        .withSpriteFrameWidth(128)
        .withUpgrade(0, {productionTimeMs: 15000})
        .withUpgrade(500, {productionTimeMs: 10000})
        .withUpgrade(1000, {productionTimeMs: 7500})
        .withUpgrade(1500, {productionTimeMs: 5000})
        .build(),
    new GameObjectDataBuilder(SAIL_FACTORY_ID, "sailFactory", "Sail Factory", 3500)
        .withIconFileName("sprite.png")
        .withSpriteFrameWidth(128)
        .withSpriteFrameHeight(128)
        .withUpgrade(0, {productionTimeMs: 15000})
        .withUpgrade(700, {productionTimeMs: 10000})
        .withUpgrade(1400, {productionTimeMs: 7500})
        .withUpgrade(2000, {productionTimeMs: 5000})
        .build(),
    new GameObjectDataBuilder(CHAIR_FACTORY_ID, "chairFactory", "Chair Factory", 4500)
        .withIconFileName("sprite.png")
        .withSpriteFrameWidth(128)
        .withSpriteFrameHeight(128)
        .withUpgrade(0, {productionTimeMs: 15000})
        .withUpgrade(1200, {productionTimeMs: 10000})
        .withUpgrade(1800, {productionTimeMs: 7500})
        .withUpgrade(2500, {productionTimeMs: 5000})
        .build(),

    new GameObjectDataBuilder(TABLE_FACTORY_ID, "tableFactory", "Table Factory", 6000)
        .withSpritesDirName("conveyorBelt")
                .withUpgrade(0, {productionTimeMs: 15000})
        .withUpgrade(1500, {productionTimeMs: 10000})
        .withUpgrade(2000, {productionTimeMs: 7500})
        .withUpgrade(2700, {productionTimeMs: 5000})
        .build(),
    new GameObjectDataBuilder(SCULPTING_WORKSHOP_ID, "sculptingWorkshop", "Sculpting Workshop", 8000)
        .withSpritesDirName("conveyorBelt")
                .withUpgrade(0, {productionTimeMs: 15000})
        .withUpgrade(1600, {productionTimeMs: 10000})
        .withUpgrade(2100, {productionTimeMs: 7500})
        .withUpgrade(2800, {productionTimeMs: 5000})
        .build(),
    new GameObjectDataBuilder(BOAT_FACTORY_ID, "boatFactory", "Boat Factory", 10500)
        .withSpritesDirName("conveyorBelt")
        .withUpgrade(0, {productionTimeMs: 30000})
        .withUpgrade(5000, {productionTimeMs: 15000})
        .withUpgrade(8000, {productionTimeMs: 7000})
        .build(),
    new GameObjectDataBuilder(SAILBOAT_FACTORY_ID, "sailboatFactory", "Sailboat Factory", 14000)
        .withSpritesDirName("conveyorBelt")
        .withUpgrade(0, {productionTimeMs: 30000})
        .withUpgrade(7000, {productionTimeMs: 15000})
        .withUpgrade(12000, {productionTimeMs: 7000})
        .build(),
    new GameObjectDataBuilder(SAILBOAT_WORKSHOP_ID, "sailboatWorkshop", "Sailboat Workshop", 18000)
        .withSpritesDirName("conveyorBelt")
        .withUpgrade(0, {productionTimeMs: 60000})
        .withUpgrade(8000, {productionTimeMs: 30000})
        .withUpgrade(15000, {productionTimeMs: 15000})
        .build(),
    new GameObjectDataBuilder(SHIP_WORKSHOP_ID, "shipWorkshops", "Ship Workshop", 50000)
        .withSpritesDirName("conveyorBelt")
        .withUpgrade(0, {productionTimeMs: 60000})
        .withUpgrade(25000, {productionTimeMs: 30000})
        .withUpgrade(40000, {productionTimeMs: 15000})
        .build(),
];


export const getGameObjectById = (id: number) => gameObjects.find((obj) => obj.id === id)