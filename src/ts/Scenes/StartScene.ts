import {debug} from "util";
declare function require(x: string): any;
import Scene from "../Scene";
import "imports-loader?THREE=three!three/examples/js/lines/LineSegmentsGeometry.js";
import "imports-loader?THREE=three!three/examples/js/lines/LineGeometry.js";
import "imports-loader?THREE=three!three/examples/js/lines/WireframeGeometry2.js";
import "imports-loader?THREE=three!three/examples/js/lines/LineMaterial.js";
import "imports-loader?THREE=three!three/examples/js/lines/LineSegments2.js";
import "imports-loader?THREE=three!three/examples/js/lines/Line2.js";
import "imports-loader?THREE=three!three/examples/js/lines/Wireframe.js";
import * as THREE from 'three'
import SceneManager from "../SceneManager";
import MotionDataPrimitive from "../MotionDataPrimitive";
import MotionData from "../MotionData";
import LineCharacter from "../LineCharacter";
const word_S = require( "../json/vertex_S.json");
const word_p = require( "../json/vertex_p.json");
const word_l = require( "../json/vertex_l.json");
const word_i = require( "../json/vertex_i.json");
const word_n = require( "../json/vertex_n.json");
const word_e = require( "../json/vertex_e.json");
const word_D = require( "../json/vertex_D.json");
const word_a = require( "../json/vertex_a.json");
const word_n2 = require( "../json/vertex_n2.json");
const word_c = require( "../json/vertex_c.json");
const word_e2 = require( "../json/vertex_e2.json");
import Simplex from "perlin-simplex";
const startSvg = require("./start.svg");
const layerShader = require("../shaders/layer.glsl");
import {TweenMax, Power0, Power1, SlowMo} from "gsap/TweenMax";
// const frag = require("../../glsl/SnoiseGradient.frag");
class LineWord
{
    mesh:any = null;
    scene:THREE.Scene;
    scale = {value:0.0};
    lineScale = {value:1.0};
    vertex:number[] = [];
    colors:number[] = [];
    translate:THREE.Vector3[] = [];
    seed:number = Math.random();
    simplex:Simplex;
    delay:number = 0;
    time:number =Math.random();
    colorA:THREE.Vector3;
    colorB:THREE.Vector3;
    isFadeOut:boolean = false;

    constructor(scene,vertex,simplex:Simplex,delay)
    {
        this.scene = scene;
        this.vertex = vertex;
        this.mesh = null;
        this.simplex = simplex;
        this.delay = delay*0.1;
        // this.translate = new THREE.Vector3(0,0,0);
        this.colorA = new THREE.Vector3(198,215,217);
        this.colorB = new THREE.Vector3(169,149,189);
        setTimeout(this.setTimeOutUpdate,delay*100);
    }

    createLine =(lineVertices:number[])=>
    {
        if(this.translate.length == 0) {
            for (let i = 0; i < lineVertices.length; i++) {
                this.translate.push(new THREE.Vector3(0,0.5,0));
            }
        }
        if(this.mesh != null){
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            this.scene.remove(this.mesh);
            // this.setTimeOutUpdate();
        }
        // @ts-ignore
        const splineGeometry = new THREE.LineGeometry();
        // splineGeometry.setPositions( lineVertices );

        this.colors.length = 0;
        this.colors = [];
        const positions = [];
        for (let i = 0; i < lineVertices.length; i++)
        {
            const v = lineVertices[i];
            var nx = this.simplex.noise(v[0],this.time*0.1)*0.02;
            var ny = this.simplex.noise(v[1],this.time*0.1+0.2)*0.02;
            if(this.isFadeOut) this.translate[i].add(new THREE.Vector3(Math.pow(Math.abs(this.simplex.noise(v[0],v[1]))*(this.lineScale.value)*0.2,1),0,0));
            positions.push(new THREE.Vector3(v[0]+nx + this.translate[i].x,v[1]+ny + this.translate[i].y,v[2]));
        }



        var splinePositions = [];

        const spline:any = new THREE.CatmullRomCurve3( positions );
        spline.curveType = 'centripetal';
        spline.tension = 0.1;
        var divisions =30;
        var color = new THREE.Color();
        for ( var i = 0, l = divisions; i < l; i ++ ) {

            var point = spline.getPoint( i / l );
            // console.log(point);
            splinePositions.push( point.x, point.y, point.z );
            // this.splineEditor.addPoint();
            var c = this.colorB.lerp(this.colorA,i/l);
            color.setHSL( Math.sin(i / l*Math.PI)*0.4+0.4, 1.0, 0.5 );
            // color.setRGB(c.x/255.0,c.x/255.0,c.z/255.0)
            this.colors.push( color.r, color.g, color.b );
        }


        splineGeometry.setPositions( splinePositions );

        splineGeometry.setColors( this.colors );

        var s = Math.sin(this.scale.value) * 0.2 + 1 ;
        s *= (this.lineScale.value*0.4 + 0.6);
        // @ts-ignore
        const splineMaterial = new THREE.LineMaterial( {
            color: 0xffffff,
            linewidth: 0.008*this.lineScale.value, // in pixels
            vertexColors: THREE.VertexColors,
            //resolution:  // to be set by renderer, eventually
            dashed: false
        } );
        // @ts-ignore

        const currentLine = new THREE.Line2( splineGeometry,splineMaterial);
        currentLine.computeLineDistances();



        currentLine.scale.set( s,s,s );
        this.scene.add( currentLine );
        this.mesh = currentLine;

    };

    setTimeOutUpdate=()=>
    {

        this.scale.value = 0;
        TweenMax.to(this.scale, 2, {value:Math.PI, onComplete:()=>this.setTimeOutUpdate()});

    };

    update()
    {
        this.time += 1;
        // console.log(this.scale.value);
        this.createLine(this.vertex)
    }

    fadeOut(delay)
    {
        setTimeout(()=>{this.isFadeOut = true;
            TweenMax.to(this.lineScale,0.8,{value:0.0});},delay * 1000);

        // TweenMax.to(this.scale,1,{value:0.2});
        // this.translate.add(new THREE.Vector3(0.1,0,0))
    }
}

export default class TestScene extends Scene {
    words:LineWord[] = [];
    isFadeOut:boolean = false;
    buttonArea:HTMLElement;
    constructor(sceneManager:SceneManager)
    {
        super(sceneManager);

        this.sceneManager.renderer.setClearAlpha(1);
        this.init();
    }

    init()
    {

        console.log(word_S);
        this.words.push(new LineWord(this.scene,word_S.vertices,this.simplex,0.0));
        this.words.push(new LineWord(this.scene,word_p.vertices,this.simplex,1.0));
        this.words.push(new LineWord(this.scene,word_l.vertices,this.simplex,2.0));
        this.words.push(new LineWord(this.scene,word_i.vertices,this.simplex,3.0));
        this.words.push(new LineWord(this.scene,word_n.vertices,this.simplex,4.0));
        this.words.push(new LineWord(this.scene,word_e.vertices,this.simplex,5.0));
        this.words.push(new LineWord(this.scene,word_D.vertices,this.simplex,6.0));
        this.words.push(new LineWord(this.scene,word_a.vertices,this.simplex,7.0));
        this.words.push(new LineWord(this.scene,word_n2.vertices,this.simplex,8.0));
        this.words.push(new LineWord(this.scene,word_c.vertices,this.simplex,9.0));
        this.words.push(new LineWord(this.scene,word_e2.vertices,this.simplex,10.0));

        var g = new THREE.BoxGeometry(100,100,100);
        var m = new THREE.MeshBasicMaterial({color:0xffffff});
        this.camera.position.set(0,0,8);

        var div = document.createElement('div');
        div.id  = ("buttonArea");
        this.buttonArea = div;
        document.querySelector('body').appendChild(div);

        var button = document.createElement('a');
        // button.textContent = "start";
        // div.appendChild(button);
        // button.addEventListener('click', this.fadeOut, true);
        // button.setAttribute("href","javascript:void(0)");
        // button.id = "startButton";

        const img = new Image();
        img.src = './imgs/start.svg';
        this.buttonArea.appendChild(img);
        img.addEventListener('click', this.fadeOut, true);
        img.id = "startButton";
        // this.scene.add(new THREE.Mesh(g,m));

    }
    fadeOut =()=>
    {
        for (let i = 0; i < this.words.length; i++)
        {
            this.words[i].fadeOut(i * 0.1);
        }
        TweenMax.to("#buttonArea",1,{opacity:0.0,onComplete:()=>{
            this.buttonArea.style.display = "none";
            }});

        setTimeout(()=>{
            this.sceneManager.sceneNum++;
            this.sceneManager.checkSceneNum();
            this.sceneManager.scenes[1].fadeIn();

            // @ts-ignore
            this.sceneManager.scenes[1].audioQuantizer.play();
            },1000 + this.words.length * 100);
    };

    onKeyDown=(e)=>{
        if(e.key == "n")
        {
        }

        if(e.key == "f")
        {
          this.fadeOut();
        }
    };

    fadeInButton()
    {
        document.getElementById("buttonArea").style.display = "block";
        TweenMax.to("#startButton",1,{color:"#00F5FF"});
    }

    update()
    {

        // @ts-ignore
        if(!this.isFadeOut && window.onLoadCount == 6)
        {
            // this.fadeOut();
            this.fadeInButton();
            this.isFadeOut = true;

        }
        for (let i = 0; i < this.words.length; i++)
        {
            this.words[i].update();
        }
    }
}