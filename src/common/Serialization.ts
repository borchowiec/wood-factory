import {MainScene} from "../game/MainScene.js";
import {getGameItemDataById} from "../game/gameItems";

export type SerializedGameItem = {
    id: number;
    x: number;
    y: number;
}

export type SerializedGameState = {
    money: number;
    items: SerializedGameItem[];
}

export function loadSerializedState(mainScene: MainScene, serializedState: SerializedGameState) {
    mainScene.setMoney(serializedState.money);
    serializedState.items
        .map(serializedItem => getGameItemDataById(serializedItem.id).createNew(serializedItem.x, serializedItem.y, mainScene))
        .forEach(item => {
            mainScene.items.push(item);
            item.paint();
        });
}

export function getSerializedState(mainScene: MainScene): SerializedGameState {
    return {
        money: mainScene.money,
        items: mainScene.items.map(item => item.serialize())
    }
}