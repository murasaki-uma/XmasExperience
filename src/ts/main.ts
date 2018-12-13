import BackGround from "./BackGround";
declare function require(x: string): any;
import SceneManager from "./SceneManager";
import TestScene from "./Scenes/TestScene";
import StartScene from "./Scenes/StartScene";
// import Scene02 from "./Scenes/SnoiseGradientScene";
require('../css/main');

document.addEventListener("DOMContentLoaded", ()=> {
    const sceneManager = new SceneManager("main",1);
    // const bgScene = new BackGround(sceneManager);
    const testScene = new TestScene(sceneManager);
    const startScene = new StartScene(sceneManager);
    sceneManager.addScene(startScene);
    sceneManager.addScene(testScene);

    sceneManager.update();

    // scenemanager.desableDebugMode();
});