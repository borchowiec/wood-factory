import React from "react";
import {IonButton, IonFooter, IonIcon} from "@ionic/react";
import {storefront} from "ionicons/icons";
import {FooterType} from "./Footer";

export const ActionsFooter: React.FC = ({setFooter}: {setFooter: (footer: FooterType) => void}) => {
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
}