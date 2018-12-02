declare function require(x: string): any;
import SceneManager from "./SceneManager";
import TestScene from "./Scenes/TestScene";
// import Scene02 from "./Scenes/SnoiseGradientScene";
require('../css/main');

document.addEventListener("DOMContentLoaded", ()=> {
    const sceneManager = new SceneManager();
    const testScene = new TestScene(sceneManager);
    sceneManager.addScene(testScene);

    sceneManager.update();

    // scenemanager.desableDebugMode();
});