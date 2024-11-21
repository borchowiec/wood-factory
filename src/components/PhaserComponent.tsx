import React, {useEffect} from "react";

import './PhaserComponent.css';
import {launch} from "../game/game.js";

const PhaserComponent: React.FC = () => {
    useEffect(() => {
        window.addEventListener('load', launch);
        return () => window.removeEventListener('load', launch);
    }, []);

    return (
        <div id="game"></div>
    );
};

export default PhaserComponent;
