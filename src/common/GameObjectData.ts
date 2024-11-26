export type GameObjectData = {
    id: number;
    name: string;
    icon: string;
    price: number;
}

export const CONVEYOR_BELT_ID = 0;

export const gameObjects: GameObjectData[] = [
    {
        id: CONVEYOR_BELT_ID,
        name: "Conveyor Belt",
        icon: "assets/objects/conveyor-belt/icon.png",
        price: 100
    },
];

export const getGameObjectById = (id: number) => gameObjects.find((obj) => obj.id === id)