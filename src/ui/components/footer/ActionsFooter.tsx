import React from "react";
import {IonButton, IonFooter, IonIcon} from "@ionic/react";
import {storefront} from "ionicons/icons";
import {FooterType} from "./Footer";
import {BaseFooter} from "./BaseFooter";
import {LIGHT_COLOR} from "../../Colors";

export const ActionsFooter: React.FC = ({setFooter}: { setFooter: (footer: FooterType) => void }) => {
    return (
        <BaseFooter>
            <IonButton
                fill="clear"
                size="large"
                style={{color: LIGHT_COLOR, border: `1px solid ${LIGHT_COLOR}`, borderRadius: "10px"}}
                onClick={() => setFooter(FooterType.SHOP)}>
                <div>
                    <IonIcon slot="icon-only" icon={storefront}></IonIcon>
                    <div style={{fontSize: "12px", fontWeight: "bold"}}>
                        Shop
                    </div>
                </div>
            </IonButton>
        </BaseFooter>
    )
}