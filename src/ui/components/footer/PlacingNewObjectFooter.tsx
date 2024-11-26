import React from "react";
import {IonButton, IonFooter, IonIcon, IonImg} from "@ionic/react";
import {checkmarkOutline, closeOutline, refreshOutline} from "ionicons/icons";
import {FooterType} from "./Footer";
import {MainScene} from "../../../game/game.js";
import {GameObjectData} from "../../../common/GameObjectData";

export const PlacingNewObjectFooter: React.FC = (
    {setFooter, showErrorMessage, mainScene, currentObject}:
        {
            setFooter: (footer: FooterType) => void,
            showErrorMessage: (message: string) => void,
            mainScene: MainScene,
            currentObject?: GameObjectData
        }) => {
    return (
        <>
            <IonButton style={{
                position: "absolute", bottom: "210px", right: "15px", fontSize: "20px", opacity: 0.7
            }}
                       shape="round"
                       color="success"
                       onClick={() => {
                           const response = mainScene.acceptNewObject();
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
                       onClick={() => mainScene.rotateNewObject()}>
                <IonIcon slot="icon-only" icon={refreshOutline}></IonIcon>
            </IonButton>
            <IonButton style={{
                position: "absolute", bottom: "70px", right: "15px", fontSize: "20px", opacity: 0.7
            }}
                       shape="round"
                       color="danger"
                       onClick={() => {
                           setFooter(FooterType.SHOP);
                           mainScene.cancelPlacingNewObject();
                       }}>
                <IonIcon slot="icon-only" icon={closeOutline}></IonIcon>
            </IonButton>

            <IonButton fill="clear" size="large" color="dark">
                <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                    <IonImg src={currentObject.icon}
                            style={{
                                padding: "2px",
                                maxWidth: "50px",
                                maxHeight: "50px",
                                border: "3px solid #fff",
                                borderRadius: "3px",
                                backgroundColor: "#fff"
                            }}
                    />
                    {/*<IonIcon slot="icon-only" icon={currentObject.icon}></IonIcon>*/}
                    <div style={{fontSize: "12px", fontWeight: "bold"}}>
                        {currentObject.name}
                    </div>
                </div>
            </IonButton>
        </>
    );
}