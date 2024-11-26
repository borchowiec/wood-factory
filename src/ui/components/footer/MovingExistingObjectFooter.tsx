import React from "react";
import {IonButton, IonFooter, IonIcon} from "@ionic/react";
import {checkmarkOutline, closeOutline, refreshOutline} from "ionicons/icons";
import {FooterType} from "./Footer";
import {MainScene} from "../../../game/MainScene.js";

export const MovingExistingObjectFooter: React.FC = (
    {setFooter, mainScene, showErrorMessage}:
        {
            setFooter: (footer: FooterType) => void,
            mainScene: MainScene,
            showErrorMessage: (message: string) => void
        }) => {
    return (
        <>
            <IonButton style={{
                position: "absolute", bottom: "210px", right: "15px", fontSize: "20px", opacity: 0.7
            }}
                       shape="round"
                       color="success"
                       onClick={() => {
                           const response = mainScene.acceptMovingObject();
                           if (response.success) {
                               setFooter(FooterType.ACTIONS);
                           } else {
                               showErrorMessage(response.message);
                           }
                       }}>
                <IonIcon slot="icon-only" icon={checkmarkOutline}></IonIcon>
            </IonButton>
            <IonButton style={{
                position: "absolute", bottom: "140px", right: "15px", fontSize: "20px", opacity: 0.7
            }}
                       shape="round"
                       color="primary"
                       onClick={() => mainScene.rotateMovingObject()}>
                <IonIcon slot="icon-only" icon={refreshOutline}></IonIcon>
            </IonButton>
            <IonButton style={{
                position: "absolute", bottom: "70px", right: "15px", fontSize: "20px", opacity: 0.7
            }}
                       shape="round"
                       color="danger"
                       onClick={() => {
                           setFooter(FooterType.ACTIONS);
                           mainScene.cancelMovingObject();
                       }}>
                <IonIcon slot="icon-only" icon={closeOutline}></IonIcon>
            </IonButton>
        </>
    );
}