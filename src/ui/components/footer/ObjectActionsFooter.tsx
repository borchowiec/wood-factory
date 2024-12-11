import React from "react";
import {IonButton, IonIcon} from "@ionic/react";
import {addOutline, closeOutline, moveOutline, trashOutline} from "ionicons/icons";
import {FooterType} from "./Footer";
import {MainScene} from "../../../game/MainScene.js";
import {BaseFooter} from "./BaseFooter";


export type UpgradeDetails = {
    isMaxLevel: boolean,
    upgradePrice: number,
    currentLevel: number
}

export const ObjectActionsFooter: React.FC = (
    {setFooter, mainScene, upgradeDetails, showErrorMessage}:
        {
            setFooter: (footer: FooterType) => void,
            mainScene: MainScene,
            upgradeDetails: UpgradeDetails,
            showErrorMessage: (message: string) => void,
        }) => {
    return (
        <BaseFooter>
            <IonButton size="large" color="primary"
                       onClick={() => {
                           mainScene.moveSelectedObject();
                           setFooter(FooterType.MOVING_EXISTING_OBJECT);
                       }}>
                <IonIcon slot="icon-only" icon={moveOutline}></IonIcon>
            </IonButton>
            <IonButton size="large" color="danger"
                       onClick={() => {
                           mainScene.sellSelection();
                           setFooter(FooterType.ACTIONS);
                       }}>
                <IonIcon slot="icon-only" icon={trashOutline}></IonIcon>
            </IonButton>
            <IonButton size="large" color="dark"
                       onClick={() => {
                           mainScene.cancelSelection();
                           setFooter(FooterType.ACTIONS);
                       }}>
                <IonIcon slot="icon-only" icon={closeOutline}></IonIcon>
            </IonButton>
            <IonButton size="large" color="warning" disabled={upgradeDetails.isMaxLevel}
                       onClick={() => {
                           const response = mainScene.upgradeSelectedObject();
                           if (!response.success) {
                               showErrorMessage(response.message);
                           }
                       }}>
                <div style={{
                    padding: "5px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                }}>
                    <div style={{fontSize: "8px", fontWeight: "bold"}}>
                        {
                            upgradeDetails.isMaxLevel ? "MAX" : `${upgradeDetails.currentLevel} lvl`
                        }
                    </div>
                    <IonIcon slot="icon-only" icon={addOutline}></IonIcon>
                    <div style={{fontSize: "8px", fontWeight: "bold"}}>
                        {
                            upgradeDetails.isMaxLevel ? " " : `\$${upgradeDetails.upgradePrice}`
                        }
                    </div>
                </div>
            </IonButton>
        </BaseFooter>
    )
}