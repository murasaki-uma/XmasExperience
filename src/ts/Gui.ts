import dat from '../../node_modules/dat.gui'

import guiValues, {default as GuiValues} from './guiValues'
import SceneManager from "./SceneManager";
// const setting = require('./JSON/gui.json');
export default class GUI{

    values:GuiValues;
    gui:any;
    sceneManager:SceneManager;
    colors:any;
    color01:any;
    color02:any;
    color03:any;
    color04:any;

    timeSpeed:dat.GUI.value;
    cellularGradientScene:dat.GUI.Folder;
    constructor(manager:SceneManager)
    {
        this.sceneManager = manager;
        // console.log(setting);
        this.values = new guiValues();
        // this.gui = new dat.GUI();
        this.gui = new dat.GUI();
        this.gui.width = 400;
        this.gui.remember(this.values);
        this.colors = this.gui.addFolder("colors");
        this.cellularGradientScene = this.gui.addFolder("CellularGradientScene");
        this.init();
    }

    init()
    {
        this.color01 = this.colors.addColor(this.values,'color01');
        this.color02 = this.colors.addColor(this.values,'color02');
        this.color03 = this.colors.addColor(this.values,'color03');
        this.color04 = this.colors.addColor(this.values,'color04');
        this.timeSpeed = this.gui.add(this.values, 'timeSpeed',0.00001,0.10000);
        this.cellularGradientScene.add(this.values,'cellScale',0.0,6.0);
        this.cellularGradientScene.add(this.values,'noiseScaleX',0.0,1.0);
        this.cellularGradientScene.add(this.values,'noiseScaleY',0.0,1.0);
        this.cellularGradientScene.add(this.values,'blurRadius',0,200);
        this.sceneManager.setTimerSpeed(this.values.timeSpeed);
        this.timeSpeed.onChange((v)=>{
            this.sceneManager.setTimerSpeed(v);
        });

    }
}