import {IonContent, IonPage} from '@ionic/react';
import PhaserComponent from "../components/PhaserComponent";

const GamePage: React.FC = () => {
    return (
        <IonPage>
            <IonContent fullscreen scrollY={false}>
                <PhaserComponent />
            </IonContent>
        </IonPage>
    );
};

export default GamePage;
