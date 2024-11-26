import {ActionsFooter} from "./ActionsFooter";
import {ShopFooter} from "./ShopFooter";
import {MainScene} from "../../../game/MainScene.js";
import {GameObjectData} from "../../../common/GameObjectData";
import {PlacingNewObjectFooter} from "./PlacingNewObjectFooter";
import {ObjectActionsFooter} from "./ObjectActionsFooter";
import {MovingExistingObjectFooter} from "./MovingExistingObjectFooter";

export enum FooterType {
    ACTIONS,
    SHOP,
    PLACING_NEW_OBJECT,
    OBJECT_ACTIONS,
    MOVING_EXISTING_OBJECT
}

export const getFooter = (
    footerType: FooterType,
    setFooter: (footer: FooterType) => void,
    showErrorMessage: (message: string) => void,
    setCurrentObject: (object: GameObjectData) => void,
    mainScene: MainScene,
    currentObject?: GameObjectData
) => {
    switch (footerType) {
        case FooterType.ACTIONS:
            return <ActionsFooter setFooter={setFooter} />;
        case FooterType.SHOP:
            return <ShopFooter
                setFooter={setFooter}
                setCurrentObject={setCurrentObject}
                showErrorMessage={showErrorMessage}
                mainScene={mainScene}
            />;
        case FooterType.PLACING_NEW_OBJECT:
            return <PlacingNewObjectFooter
                setFooter={setFooter}
                showErrorMessage={showErrorMessage}
                mainScene={mainScene}
                currentObject={currentObject}
            />;
        case FooterType.OBJECT_ACTIONS:
            return <ObjectActionsFooter
                setFooter={setFooter}
                mainScene={mainScene}
            />
        case FooterType.MOVING_EXISTING_OBJECT:
            return <MovingExistingObjectFooter
                setFooter={setFooter}
                mainScene={mainScene}
                showErrorMessage={showErrorMessage}
            />
    }
}