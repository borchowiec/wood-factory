import React from "react";
import {IonFooter} from "@ionic/react";
import {LIGHTER_COLOR} from "../../Colors";

export const BaseFooter: React.FC = ({children}: {children: React.ReactNode}) => {
    return (
        <div style={{backgroundColor: LIGHTER_COLOR}}>
            <IonFooter
                style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    padding: '5px'
                }}>
                {children}
            </IonFooter>
        </div>
    )
}