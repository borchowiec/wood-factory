import React from "react";
import {IonButton, IonFooter, IonIcon} from "@ionic/react";
import {closeOutline, moveOutline, trashOutline} from "ionicons/icons";
import {FooterType} from "./Footer";
import {MainScene} from "../../../game/MainScene.js";
import {BaseFooter} from "./BaseFooter";

export const ObjectActionsFooter: React.FC = (
    {setFooter, mainScene}:
        {
            setFooter: (footer: FooterType) => void,
            mainScene: MainScene
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
        </BaseFooter>
    )
}