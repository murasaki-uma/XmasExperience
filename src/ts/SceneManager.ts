'use strict'
import * as THREE from 'three'
import "imports-loader?THREE=three!three/examples/js/controls/OrbitControls.js";
import Scene from './Scene';
import GUI from "./Gui";
import Timer from "./Util/Timer";
export default class SceneManager{
    width:number;
    height:number;
    renderer:THREE.WebGLRenderer;
    debugCamera:THREE.PerspectiveCamera;
    DEBUG_MODE:boolean;
    activeCamera:THREE.PerspectiveCamera;
    gui:any;
    frameCount:number
    scenes:Scene[];
    sceneNum:number;
    controls:THREE.OrbitControls;
    canvas:any;
    clock:THREE.Clock;
    timer:Timer;
    key_sceneNext = "ArrowRight";
    key_scenePrev = "ArrowLeft";
    offScreenTarget:THREE.WebGLRenderTarget;
    isAbsoluteResolution:boolean = false;
    abosluteResolution:THREE.Vector2;
    constructor(canvasId? : string)
    {

        this.timer = new Timer();
        this.canvas = canvasId ? document.getElementById(canvasId) : null;
        this.width = window.innerWidth;
        this.height= window.innerHeight;
        if(this.canvas)
        {
            this.renderer = new THREE.WebGLRenderer({
                preserveDrawingBuffer: true,antialias:true,alpha:true,canvas:this.canvas
            });
        } else
        {
            this.renderer = new THREE.WebGLRenderer({
                preserveDrawingBuffer: true,antialias:true,alpha:true,
            });
            document.body.appendChild( this.renderer.domElement );
        }

        // this.renderer.setClearColor(0x000000);
        // this.renderer.setPixelRatio( 0.5 );
        // this.renderer.setPixelRatio(window.devicePixelRatio);
        let dpr = this.renderer.getPixelRatio();
        this.offScreenTarget = new THREE.WebGLRenderTarget(window.innerWidth*dpr,window.innerHeight*dpr);
        this.offScreenTarget.texture.generateMipmaps = false;
        this.offScreenTarget.stencilBuffer = false;
        this.offScreenTarget.depthBuffer = false;


        this.debugCamera = new THREE.PerspectiveCamera(70,this.width/this.height,0.1,10000);
        this.DEBUG_MODE = false;
        this.activeCamera = null;
        this.frameCount = 0;
        this.gui = new GUI(this);
        this.scenes = [];
        this.sceneNum = 0;
        this.clock = new THREE.Clock();
        this.clock.autoStart = true;


        this.init();
    }

    init()
    {


        this.debugCamera.position.set(0,-50,10);
        this.renderer.setPixelRatio(0.5);
        this.renderer.setSize(this.width,this.height);

        this.renderer.domElement.id = "out";
        //document.getElementById('render').appendChild( this.renderer.domElement );
        window.addEventListener('resize',this.onWindowResize.bind(this));
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener( 'click', this.onClick.bind(this), false );
        window.addEventListener('mousedown', this.onMouseDown);
        window.addEventListener('mouseup',this.onMouseUp);
        window.addEventListener('mousemove',this.onMouseMove);


        this.controls = new THREE.OrbitControls( this.debugCamera );
        this.controls.enableKeys = false;
        this.controls.update();
        this.onWindowResize();

    }



    setAbsoluteResolution(width:number, height:number)
    {
        this.isAbsoluteResolution = true;
        this.abosluteResolution.set(width,height);

        this.debugCamera.aspect = this.abosluteResolution.x / this.abosluteResolution.y;
        this.debugCamera.updateProjectionMatrix();
        let dpr = this.renderer.getPixelRatio();
        this.renderer.setSize( this.abosluteResolution.x,this.abosluteResolution.y );
        this.offScreenTarget.setSize(this.abosluteResolution.x*dpr, this.abosluteResolution.y*dpr);

    }

    desableAbsoluteResolution()
    {
        this.isAbsoluteResolution = false;
    }


    getCurrentScene()
    {
        return this.scenes[this.sceneNum];
    }

    setDebugCameraPosition(v:THREE.Vector3)
    {
        this.debugCamera.position.set(v.x,v.y,v.z);
    }

    stopTimer()
    {
        this.timer.stop();
    }

    resetTimer()
    {
        this.timer.reset();
    }

    setTimerSpeed(value:number)
    {
        this.timer.setSpeed(value);
    }

    addScene(scene)
    {
        this.scenes.push(scene);
        this.cameraChange();
    }
    onMouseMove =(e)=>
    {
        this.getCurrentScene().onMouseMove(e);
    }
    onMouseDown =(e)=>
    {
        this.getCurrentScene().onMouseDown(e);
    }

    onMouseUp =(e)=>
    {
        this.getCurrentScene().onMouseUp(e);
    }


    onKeyDown(e)
    {
        if(e.key == 'd')
        {
            this.debug();
        }

        if(e.key == 's')
        {
            this.saveCanvas('image/png');
        }

        try {
            if (e.key == this.key_sceneNext) {
                this.sceneNum++;
                this.checkSceneNum();
            }
            if (e.key == this.key_scenePrev) {

                this.sceneNum--;
                this.checkSceneNum();
            }
        } catch (e)

        {
            console.log(e);
        }

        this.getCurrentScene().onKeyDown(e);


    }

    checkSceneNum = () =>
    {
        if(this.sceneNum <0)
        {
            this.sceneNum = this.scenes.length-1;
        }

        if(this.sceneNum >= this.scenes.length)
        {
            this.sceneNum = 0;
        }

    };

    debug()
    {
        this.DEBUG_MODE = !this.DEBUG_MODE;
        this.cameraChange();
    }

    enableDebugMode()
    {
        this.DEBUG_MODE = true;
        this.cameraChange();

    }

    getDebugMode()
    {
        return this.DEBUG_MODE;
    }

    desableDebugMode()
    {
        this.DEBUG_MODE = false;
        this.cameraChange();
    }

    cameraChange()
    {

        if(this.DEBUG_MODE)
        {
            this.activeCamera = this.debugCamera;
        }else
        {
            this.activeCamera = this.scenes[this.sceneNum].camera;
        }


    }


    onWindowResize =(e?)=>
    {

        if(this.isAbsoluteResolution) return;
        this.debugCamera.aspect = window.innerWidth / window.innerHeight;
        this.debugCamera.updateProjectionMatrix();
        let dpr = this.renderer.getPixelRatio();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.offScreenTarget.setSize(window.innerWidth*dpr, window.innerHeight*dpr);
        if(this.scenes.length > 0)
        {
            this.scenes[this.sceneNum].onWindowResize(e);
        }


        console.log("Width: " + window.innerWidth, " height: " + window.innerHeight);



    }

    onClick(e)
    {
        this.scenes[this.sceneNum].onClick(e);
    }

    update =()=>
    {

        this.frameCount++;
        this.timer.update();
        // this.controls.update();
        // this.frameCount = this.frameCount % 60;
        requestAnimationFrame(this.update);
        this.scenes[this.sceneNum].update();
        if(this.DEBUG_MODE)
        {
            this.renderer.render(this.scenes[this.sceneNum].scene,this.scenes[this.sceneNum].camera);
        } else
        {
            // this.renderer.render(this.scene_Modi.scene,this.debugCamera);
        }

        this.renderer.render(this.getCurrentScene().scene,this.activeCamera,this.offScreenTarget);
        this.renderer.render(this.scenes[this.sceneNum].scene,this.activeCamera);
    }



    //
    // download(name) {
    //     var blob = new Blob([this.renderer.domElement.toDataURL()]);
    //
    //     var a = document.createElement("a");
    //     a.href = URL.createObjectURL(blob);
    //     a.target = '_blank';
    //     a.download = name;
    //     a.click();
    // }

    getCurrentSceneRenderTexture()
    {
        return this.offScreenTarget.texture;
    }

    saveCanvas(saveType){
        let imageType = "image/png";
        let fileName = "sample.png";
        // if(saveType === "jpeg"){
        //     imageType = "image/jpeg";
        //     fileName = "sample.jpg";
        // }
        // console.log(this.renderer.domElement.toDataURL());
        let canvas:any = document.getElementById("out");
        // base64エンコードされたデータを取得 「data:image/png;base64,iVBORw0k～」
        let base64 = canvas.toDataURL();
        // console.log(base64);
        // base64データをblobに変換
        let blob = this.Base64toBlob(base64);
        // blobデータをa要素を使ってダウンロード
        this.saveBlob(blob, fileName);
    }

    Base64toBlob(base64)
    {
        // カンマで分割して以下のようにデータを分ける
        // tmp[0] : データ形式（data:image/png;base64）
        // tmp[1] : base64データ（iVBORw0k～）
        let tmp = base64.split(',');
        // base64データの文字列をデコード
        let data = atob(tmp[1]);
        // tmp[0]の文字列（data:image/png;base64）からコンテンツタイプ（image/png）部分を取得
        let mime = tmp[0].split(':')[1].split(';')[0];
        //  1文字ごとにUTF-16コードを表す 0から65535 の整数を取得
        let buf = new Uint8Array(data.length);
        for (let i = 0; i < data.length; i++) {
            buf[i] = data.charCodeAt(i);
        }
        // blobデータを作成
        let blob = new Blob([buf], { type: mime });
        return blob;
    }

// 画像のダウンロード
    saveBlob(blob, fileName)
    {
        let url = window.URL;
        // ダウンロード用のURL作成
        let dataUrl = url.createObjectURL(blob);
        // イベント作成
        let event = document.createEvent("MouseEvents");
        event.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        // a要素を作成
        let a:any = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
        // ダウンロード用のURLセット
        a.href = dataUrl;
        // ファイル名セット
        a.download = fileName;
        // イベントの発火
        a.dispatchEvent(event);
    }

    toBlob(base64) {
        var bin = atob(base64.replace(/^.*,/, ''));
        var buffer = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) {
            buffer[i] = bin.charCodeAt(i);
        }
        // Blobを作成
        try{
            var blob = new Blob([buffer.buffer], {
                type: 'image/png'
            });
        }catch (e){
            return false;
        }
        return blob;
    }
}