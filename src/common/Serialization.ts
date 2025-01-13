import {MainScene} from "../game/MainScene.js";
import {getGameItemDataById} from "../game/gameItems";
import {GRID_HEIGHT, GRID_WIDTH} from "../game/properties";
import {createObject} from "../game/gameObjects";

export type SerializedGameItem = {
    id: number;
    x: number;
    y: number;
}

export type SerializedGameObject = {
    id: number;
    details: object;
}

export type SerializedGameState = {
    money: number;
    items: SerializedGameItem[];
    objects: SerializedGameObject[];
}

export function loadSerializedState(mainScene: MainScene, serializedState: SerializedGameState) {
    mainScene.setMoney(serializedState.money);
    serializedState.items
        .map(serializedItem => getGameItemDataById(serializedItem.id).createNew(serializedItem.x, serializedItem.y, mainScene))
        .forEach(item => {
            mainScene.items.push(item);
            item.paint();
        });

    serializedState.objects
        .forEach(serializedObject => {
            const newObject = createObject(serializedObject.id, mainScene);
            newObject.deserialize(serializedObject);
            newObject.placeOnGrid();
            newObject.paint();
        });
}

export function getSerializedState(mainScene: MainScene): SerializedGameState {
    return {
        money: mainScene.money,
        items: mainScene.items.map(item => item.serialize()),
        objects: getSerializedObjects(mainScene)
    }
}


function getSerializedObjects(mainScene: MainScene) {
    const serializedObjects: SerializedGameObject[] = [];
    for (let gridX = 0; gridX < GRID_WIDTH; gridX++) {
        for (let gridY = 0; gridY < GRID_HEIGHT; gridY++) {
            let gridObject = mainScene.grid[gridX][gridY];
            if (gridObject && gridObject.gridX === gridX && gridObject.gridY === gridY) {
                serializedObjects.push(gridObject.serialize());
            }
        }
    }

    return serializedObjects;
}