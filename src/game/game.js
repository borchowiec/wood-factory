import {AUTO, Game, Scale} from "phaser";
import {MainScene} from "./MainScene.js";

export function launch(serializedState) {
    const game = new Game({
        type: AUTO,
        pixelArt: true,
        scale: {
            mode: Scale.RESIZE,
            width: window.innerWidth * window.devicePixelRatio,
            autoCenter: Scale.CENTER_BOTH,
            height: window.innerHeight * window.devicePixelRatio,
        },
        parent: "game",
        backgroundColor: "#201726",
        physics: {
            default: "arcade",
        },
        scene: MainScene
    });

    game.scene.start("MainScene", {
        serializedState: serializedState
    });

    return game;
}