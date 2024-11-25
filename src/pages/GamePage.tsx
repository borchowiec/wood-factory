import {IonButton, IonContent, IonFooter, IonIcon, IonPage, IonText} from '@ionic/react';
import React, {useEffect, useState} from "react";
import {Game} from "phaser";
import {launch, MainScene} from "../game/game.js";
import "./GamePage.css";
import {
    backspaceOutline,
    checkmarkOutline,
    chevronBackOutline,
    chevronForwardOutline, closeOutline, moveOutline, refreshOutline,
    storefront, trashOutline
} from "ionicons/icons";
import {CONVEYOR_BELT_ID} from "../game/properties.js";
import GameObject = Phaser.GameObjects.GameObject;
import {getPrice} from "../game/gameObjects.js";

enum FooterType {
    ACTIONS,
    SHOP,
    PLACING_NEW_OBJECT,
    OBJECT_ACTIONS,
    MOVING_EXISTING_OBJECT
}

type GameObject = {
    id: number;
    name: string;
    icon: string;
    price: number;
}

const GamePage: React.FC = () => {
    const [game, setGame] = useState(undefined as Game);
    const [footer, setFooter] = useState(FooterType.ACTIONS);

    const [money, setMoney] = useState(0);
    const [shopCurrentPage, setShopCurrentPage] = useState(0);
    const [currentObject, setCurrentObject] = useState(undefined as GameObject);
    const [errorMessage, setErrorMessage] = useState(undefined as string);

    const showErrorMessage = (message) => {
        setErrorMessage(message);
        setTimeout(() => {
            setErrorMessage(null);
        }, 5000);
    };

    const gameObjects: GameObject[] = [
        {id: CONVEYOR_BELT_ID, name: "Conveyor Belt", icon: storefront, price: getPrice(CONVEYOR_BELT_ID)},
    ];

    useEffect(() => {
        const handleLoad = () => {
            const game = launch();
            setGame(game);
        }
        const handleMoneyUpdate = event => {
            setMoney(event.detail.money);
        }

        const handleMovingExistingObject = () => {
            setFooter(FooterType.OBJECT_ACTIONS);
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

    const getFooter = () => {
        switch (footer) {
            case FooterType.ACTIONS:
                return (
                    <div style={{backgroundColor: "#E4D08E"}}>
                        <IonFooter
                            style={{
                                display: 'flex',
                                justifyContent: 'space-around',
                                padding: '5px'
                            }}>
                            <IonButton
                                fill="clear"
                                size="large"
                                style={{color: "#DC9E36", border: "1px solid #DC9E36", borderRadius: "10px"}}
                                onClick={() => setFooter(FooterType.SHOP)}>
                                <div>
                                    <IonIcon slot="icon-only" icon={storefront}></IonIcon>
                                    <div style={{fontSize: "12px", fontWeight: "bold"}}>
                                        Shop
                                    </div>
                                </div>
                            </IonButton>
                        </IonFooter>
                    </div>
                )
            case FooterType.SHOP:
                return (
                    <>
                        <IonButton style={{margin: "5px", fontSize: "20px", opacity: 0.7}} shape="round" color="danger"
                                   onClick={() => setFooter(FooterType.ACTIONS)}>
                            <IonIcon slot="icon-only" icon={backspaceOutline}></IonIcon>
                        </IonButton>
                        <div style={{backgroundColor: "#E4D08E"}}>
                            <IonFooter
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-around',
                                    padding: '5px'
                                }}
                            >
                                <IonButton fill="clear" size="large"
                                           style={{color: "#DC9E36"}}
                                           onClick={() => setShopCurrentPage((shopCurrentPage - 1 + Math.ceil(gameObjects.length / 3)) % Math.ceil(gameObjects.length / 3))}>
                                    <IonIcon slot="icon-only" icon={chevronBackOutline}></IonIcon>
                                </IonButton>
                                {gameObjects.slice(shopCurrentPage * 3, shopCurrentPage * 3 + 3).map(object => (
                                    <IonButton
                                        key={object.id}
                                        fill="clear"
                                        size="large"
                                        style={{
                                            color: "#DC9E36",
                                            border: "1px solid #DC9E36",
                                            borderRadius: "10px"
                                        }}
                                        onClick={() => {
                                            const response = getMainScene().setNewPotentialObject(object.id);
                                            if (response.success) {
                                                setCurrentObject(object);
                                                setFooter(FooterType.PLACING_NEW_OBJECT);
                                            } else {
                                                showErrorMessage(response.message);
                                            }
                                        }}
                                    >
                                        <div style={{padding: "5px"}}>
                                            <div style={{fontSize: "12px", fontWeight: "bold"}}>
                                                ${object.price}
                                            </div>
                                            <IonIcon slot="icon-only" icon={object.icon}></IonIcon>
                                            <div style={{fontSize: "12px", fontWeight: "bold"}}>
                                                {object.name}
                                            </div>
                                        </div>
                                    </IonButton>
                                ))}
                                <IonButton fill="clear" size="large"
                                           onClick={() => setShopCurrentPage((shopCurrentPage + 1) % Math.ceil(gameObjects.length / 3))}
                                           style={{color: "#DC9E36"}}
                                >
                                    <IonIcon slot="icon-only" icon={chevronForwardOutline}></IonIcon>
                                </IonButton>
                            </IonFooter>
                        </div>
                    </>
                )
            case FooterType.PLACING_NEW_OBJECT:
                return (
                    <>
                        <IonButton style={{
                            position: "absolute", bottom: "210px", right: "15px", fontSize: "20px", opacity: 0.7
                        }}
                                   shape="round"
                                   color="success"
                                   onClick={() => {
                                       const response = getMainScene().acceptNewObject();
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
                                   onClick={() => getMainScene().rotateNewObject()}>
                            <IonIcon slot="icon-only" icon={refreshOutline}></IonIcon>
                        </IonButton>
                        <IonButton style={{
                            position: "absolute", bottom: "70px", right: "15px", fontSize: "20px", opacity: 0.7
                        }}
                                   shape="round"
                                   color="danger"
                                   onClick={() => {
                                       setFooter(FooterType.SHOP);
                                       getMainScene().cancelPlacingNewObject();
                                   }}>
                            <IonIcon slot="icon-only" icon={closeOutline}></IonIcon>
                        </IonButton>

                        <IonButton fill="clear" size="large" color="dark">
                            <div>
                                <IonIcon slot="icon-only" icon={currentObject.icon}></IonIcon>
                                <div style={{fontSize: "12px", fontWeight: "bold"}}>
                                    {currentObject.name}
                                </div>
                            </div>
                        </IonButton>
                    </>
                );
            case FooterType.OBJECT_ACTIONS:
                return (
                    <div style={{backgroundColor: "#E4D08E"}}>
                        <IonFooter
                            style={{
                                display: 'flex',
                                justifyContent: 'space-around',
                                padding: '5px'
                            }}>
                            <IonButton size="large" color="primary"
                                       onClick={() => {
                                           getMainScene().moveSelectedObject();
                                           setFooter(FooterType.MOVING_EXISTING_OBJECT);
                                       }}>
                                <IonIcon slot="icon-only" icon={moveOutline}></IonIcon>
                            </IonButton>
                            <IonButton size="large" color="danger"
                                       onClick={() => {
                                           getMainScene().sellSelection();
                                           setFooter(FooterType.ACTIONS);
                                       }}>
                                <IonIcon slot="icon-only" icon={trashOutline}></IonIcon>
                            </IonButton>
                            <IonButton size="large" color="dark"
                                       onClick={() => {
                                           getMainScene().cancelSelection();
                                           setFooter(FooterType.ACTIONS);
                                       }}>
                                <IonIcon slot="icon-only" icon={closeOutline}></IonIcon>
                            </IonButton>
                        </IonFooter>
                    </div>
                )
            case FooterType.MOVING_EXISTING_OBJECT:
                return (
                    <>
                        <IonButton style={{
                            position: "absolute", bottom: "210px", right: "15px", fontSize: "20px", opacity: 0.7
                        }}
                                   shape="round"
                                   color="success"
                                   onClick={() => {
                                       const response = getMainScene().acceptMovingObject();
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
                                   onClick={() => getMainScene().rotateMovingObject()}>
                            <IonIcon slot="icon-only" icon={refreshOutline}></IonIcon>
                        </IonButton>
                        <IonButton style={{
                            position: "absolute", bottom: "70px", right: "15px", fontSize: "20px", opacity: 0.7
                        }}
                                   shape="round"
                                   color="danger"
                                   onClick={() => {
                                       setFooter(FooterType.ACTIONS);
                                       getMainScene().cancelMovingObject();
                                   }}>
                            <IonIcon slot="icon-only" icon={closeOutline}></IonIcon>
                        </IonButton>
                    </>
                );
        }
    }

    return (
        <IonPage>
            <div style={{position: "fixed", right: "10px", top: "10px", zIndex: "1000"}}>
                <IonText style={{color: "#DC9E36",fontWeight: "bold"}}>
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
                <div id="game"></div>
            </IonContent>
            <div style={{position: "fixed", left: "0", bottom: "0", zIndex: "900", width: "100%"}}>
                {getFooter()}
            </div>
        </IonPage>
    );
};

export default GamePage;
