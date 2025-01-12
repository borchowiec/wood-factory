import React from "react";
import {IonButton, IonIcon} from "@ionic/react";
import {backspaceOutline} from "ionicons/icons";
import {FooterType} from "./Footer";
import {GameObjectData, gameObjects} from "../../../common/GameObjectData";
import {MainScene} from "../../../game/MainScene.js";
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
    return (
        <>
            <IonButton style={{margin: "5px", fontSize: "20px", opacity: 0.7}} shape="round" color="danger"
                       onClick={() => setFooter(FooterType.ACTIONS)}>
                <IonIcon slot="icon-only" icon={backspaceOutline}></IonIcon>
            </IonButton>
            <BaseFooter>
                <div style={{
                    display: "flex",
                    overflowX: "auto",
                    padding: "10px",
                    gap: "10px",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none"
                }}>
                    {gameObjects.map(object => (
                        <IonButton
                            key={object.id}
                            fill="clear"
                            size="large"
                            style={{
                                color: LIGHT_COLOR,
                                border: `1px solid ${LIGHT_COLOR}`,
                                borderRadius: "10px",
                                padding: "0",
                                width: "100px",
                                minWidth: "100px",
                                flexShrink: 0
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
                                padding: "0",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center"
                            }}>
                                <div style={{fontSize: "10px", fontWeight: "bold"}}>
                                    ${object.price}
                                </div>
                                <img src={object.imageData.icon} style={{marginBottom: "5px", maxWidth: "32px", maxHeight: "32px"}}/>
                                <div style={{fontSize: "10px", fontWeight: "bold"}}>
                                    {object.name}
                                </div>
                            </div>
                        </IonButton>
                    ))}
                </div>
            </BaseFooter>
        </>
    )
}
