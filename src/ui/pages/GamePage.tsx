import {IonButton, IonContent, IonIcon, IonPage, IonText} from '@ionic/react';
import React, {useEffect, useState} from "react";
import {Game} from "phaser";
import {launch, MainScene} from "../../game/game.js";
import {addCircleOutline, removeCircleOutline} from "ionicons/icons";
import {FooterType, getFooter} from "../components/footer/Footer";
import {GameObjectData} from "../../common/GameObjectData";
import {UpgradeDetails} from "../components/footer/ObjectActionsFooter";
import {SerializedGameState} from "../../common/Serialization";

const GamePage: React.FC = () => {
    const [game, setGame] = useState(undefined as Game);
    const [footer, setFooter] = useState(FooterType.ACTIONS);

    const [money, setMoney] = useState(0);
    const [upgradeDetails, setUpgradeDetails] = useState({isMaxLevel: false, currentLevel: 1, upgradePrice: 0} as UpgradeDetails);
    const [hasModifyButton, setHasModifyButton] = useState(false);
    const [currentObject, setCurrentObject] = useState(undefined as GameObjectData);
    const [errorMessage, setErrorMessage] = useState(undefined as string);

    const showErrorMessage = (message) => {
        setErrorMessage(message);
        setTimeout(() => {
            setErrorMessage(null);
        }, 5000);
    };

    useEffect(() => {
        const initSerializedState: SerializedGameState = {
            "money": 994900,
            "items": [
                {
                    "id": 1,
                    "x": 106.95,
                    "y": 192
                }
            ]
        };
        // const initSerializedState: SerializedGameState = {
        //     money: 10000,
        //     items: []
        // };

        const handleLoad = () => {
            const game = launch(initSerializedState);
            setGame(game);
        }
        const handleMoneyUpdate = event => {
            setMoney(event.detail.money);
        }

        const handleMovingExistingObject = event => {
            setFooter(FooterType.OBJECT_ACTIONS);
            setUpgradeDetails(event.detail.upgradeDetails);
            setHasModifyButton(event.detail.hasModifyButton);
        }

        window.addEventListener('moneyUpdate', handleMoneyUpdate);
        window.addEventListener('movingExistingObject', handleMovingExistingObject);
        window.addEventListener('load', handleLoad);
        return () => {
            window.removeEventListener('moneyUpdate', handleMoneyUpdate);
            window.removeEventListener('load', handleLoad);
        }
    }, []);

    const getMainScene = () => {
        return game.scene.getScene("MainScene") as MainScene;
    }

    return (
        <IonPage>
            <div style={{
                left: "10px",
                top: "10px",
                zIndex: "1000",
                position: "fixed",
                backgroundColor: "#E4D08E",
                borderRadius: "20px",
                padding: "1px 5px",
            }}>
                <IonButton fill="clear" size="small"
                           onClick={() => getMainScene().zoomOut()}
                           style={{color: "#DC9E36"}}
                >
                    <IonIcon slot="icon-only" style={{fontSize: "30px"}} icon={removeCircleOutline}></IonIcon>
                </IonButton>
                <IonButton fill="clear" size="small"
                           onClick={() => getMainScene().zoomIn()}
                           style={{color: "#DC9E36"}}
                >
                    <IonIcon slot="icon-only" style={{fontSize: "30px"}} icon={addCircleOutline}></IonIcon>
                </IonButton>
            </div>
            <div style={{position: "fixed", right: "10px", top: "10px", zIndex: "1000"}}>
                <IonText style={{color: "#DC9E36", fontWeight: "bold"}}>
                    ${money}
                </IonText>
            </div>
            {
                errorMessage &&
                <div style={{
                    position: "fixed",
                    left: "50%",
                    transform: "translateX(-50%)",
                    top: "50px",
                    zIndex: "1100"
                }}>
                    <div>
                        <IonText color="danger">
                            {errorMessage}
                        </IonText>
                    </div>
                </div>
            }
            <IonContent fullscreen scrollY={false}>
                <div
                    id="game"
                    style={{
                        height: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        margin: 0
                    }}
                />
            </IonContent>
            <div style={{position: "fixed", left: "0", bottom: "0", zIndex: "900", width: "100%"}}>
                {
                    game ?
                        getFooter(
                            footer,
                            setFooter,
                            showErrorMessage,
                            setCurrentObject,
                            getMainScene(),
                            currentObject,
                            upgradeDetails,
                            hasModifyButton
                        )
                        : <></>
                }
            </div>
        </IonPage>
    );
};

export default GamePage;
