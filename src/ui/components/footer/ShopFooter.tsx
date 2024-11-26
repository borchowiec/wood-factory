import React, {useState} from "react";
import {IonButton, IonFooter, IonIcon, IonImg} from "@ionic/react";
import {backspaceOutline, chevronBackOutline, chevronForwardOutline, storefront} from "ionicons/icons";
import {FooterType} from "./Footer";
import {GameObjectData, gameObjects} from "../../../common/GameObjectData";
import {MainScene} from "../../../game/game.js";
import {BaseFooter} from "./BaseFooter";
import {LIGHT_COLOR} from "../../Colors";

export const ShopFooter: React.FC = (
    {setFooter, setCurrentObject, showErrorMessage, mainScene}:
        {
            setFooter: (footer: FooterType) => void,
            setCurrentObject: (object: GameObjectData) => void,
            showErrorMessage: (message: string) => void,
            mainScene: MainScene
        }
) => {
    const [shopCurrentPage, setShopCurrentPage] = useState(0);

    return (
        <>
            <IonButton style={{margin: "5px", fontSize: "20px", opacity: 0.7}} shape="round" color="danger"
                       onClick={() => setFooter(FooterType.ACTIONS)}>
                <IonIcon slot="icon-only" icon={backspaceOutline}></IonIcon>
            </IonButton>
            <BaseFooter>
                <IonButton fill="clear" size="large"
                           style={{color: LIGHT_COLOR}}
                           onClick={() => setShopCurrentPage((shopCurrentPage - 1 + Math.ceil(gameObjects.length / 3)) % Math.ceil(gameObjects.length / 3))}>
                    <IonIcon slot="icon-only" icon={chevronBackOutline}></IonIcon>
                </IonButton>
                {gameObjects.slice(shopCurrentPage * 3, shopCurrentPage * 3 + 3).map(object => (
                    <IonButton
                        key={object.id}
                        fill="clear"
                        size="large"
                        style={{
                            color: LIGHT_COLOR,
                            border: `1px solid ${LIGHT_COLOR}`,
                            borderRadius: "10px",
                            padding: "0",
                            width: "100px"
                        }}
                        onClick={() => {
                            const response = mainScene.setNewPotentialObject(object.id);
                            if (response.success) {
                                setCurrentObject(object);
                                setFooter(FooterType.PLACING_NEW_OBJECT);
                            } else {
                                showErrorMessage(response.message);
                            }
                        }}
                    >
                        <div style={{
                            padding: "5px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center"
                        }}>
                            <div style={{fontSize: "12px", fontWeight: "bold"}}>
                                ${object.price}
                            </div>
                            <IonImg src={object.icon} style={{maxWidth: "32px", maxHeight: "32px"}}/>
                            <div style={{fontSize: "12px", fontWeight: "bold"}}>
                                {object.name}
                            </div>
                        </div>
                    </IonButton>
                ))}
                <IonButton fill="clear" size="large"
                           onClick={() => setShopCurrentPage((shopCurrentPage + 1) % Math.ceil(gameObjects.length / 3))}
                           style={{color: LIGHT_COLOR}}
                >
                    <IonIcon slot="icon-only" icon={chevronForwardOutline}></IonIcon>
                </IonButton>
            </BaseFooter>
        </>
    )
}