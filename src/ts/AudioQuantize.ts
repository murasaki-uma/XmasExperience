import * as THREE from 'three'
import Scene from "./Scene";
import {debug} from "util";

class AudioManager
{
    public audio:THREE.Audio;
    public duration:number;
    public isLoop:boolean = false;
    constructor(audioListener:THREE.AudioListener, buffer)
    {
        this.audio = new THREE.Audio(audioListener);
        this.audio.setBuffer(buffer);
        this.audio.setLoop( false );
        this.audio.setVolume( 0.1);
        this.duration = Math.floor(buffer.duration);
        console.log(this.duration);
        this.isLoop = false;
    }

    public stop()
    {
        this.audio.stop();
    }

    public play=()=>
    {

        // if(this.audio.isPlaying) this.audio.stop();
        this.audio.startTime = 0.0;
        this.audio.play();
        // if(this.isLoop)
        // {
        //     setTimeout(()=>{this.play();}, this.duration *1000);
        //     // setTimeout(this.play(), 16);
        // }
    };
}
enum AudioType {
    A,
    B,
    C,
    D,
}
export default class AudioQuantize {
    listener:THREE.AudioListener;
    scene:Scene;
    audioLoader:THREE.AudioLoader;
    soundA:AudioManager;
    soundB:AudioManager;
    soundC:AudioManager;
    soundD:AudioManager;
    soundBG:AudioManager;
    soundFX:AudioManager;
    isAC:boolean = true;
    isBD:boolean = true;
    timeLineAC:AudioType[] = [];
    timeLineBD:AudioType[] = [];
    currentAudio01:AudioManager = null;
    currentAudio02:AudioManager = null;

    constructor(scene:THREE.Scene,camera:THREE.PerspectiveCamera)
    {

        this.listener = new THREE.AudioListener();
        camera.add( this.listener );
        this.audioLoader = new THREE.AudioLoader();
        // @ts-ignore

        this.audioLoader.load( 'https://murasaki-uma.github.io/XmasExperienceAssets/music/A.mp3', ( buffer )=> {
            this.soundA = new AudioManager(this.listener,buffer);
            // this.soundA.play();
        });
        // @ts-ignore

        this.audioLoader.load( 'https://murasaki-uma.github.io/XmasExperienceAssets/music/B.mp3', ( buffer )=> {
            this.soundB = new AudioManager(this.listener,buffer);
        });
        // @ts-ignore

        this.audioLoader.load( 'https://murasaki-uma.github.io/XmasExperienceAssets/music/C.mp3', ( buffer )=> {
            this.soundC = new AudioManager(this.listener,buffer);
        });
        // @ts-ignore

        this.audioLoader.load( 'https://murasaki-uma.github.io/XmasExperienceAssets/music/D.mp3', ( buffer )=> {
            this.soundD = new AudioManager(this.listener,buffer);
        });
        // @ts-ignore

        this.audioLoader.load( 'https://murasaki-uma.github.io/XmasExperienceAssets/music/BG.mp3', ( buffer )=> {
            this.soundBG = new AudioManager(this.listener,buffer);
        });
        // @ts-ignore

        this.audioLoader.load( 'https://murasaki-uma.github.io/XmasExperienceAssets/music/FX.mp3', ( buffer )=> {
            this.soundFX = new AudioManager(this.listener,buffer);
        });

        this.timeLineAC.push(AudioType.A);
        this.timeLineBD.push(AudioType.D);
        window.addEventListener('keydown', this.onKeyDown.bind(this));
    }

    public toggleAC()
    {
        this.isAC != this.isAC;
        this.timeLineAC.push(this.isAC ? AudioType.A : AudioType.C);
    }
    public toggleBD()
    {
        this.isBD != this.isBD;
        this.timeLineBD.push(this.isBD ? AudioType.B : AudioType.D);
    }

    // public Stop()
    //
    // {
    //     this.soundA.stop();
    //     this.soundB.stop();
    //     this.soundC.stop();
    //     this.soundD.stop();
    //     // this.soundA.stop();
    //
    // }

    public play=()=>
    {

        if(this.timeLineAC.length > 1) this.timeLineAC.shift();
        if(this.timeLineBD.length > 1) this.timeLineBD.shift();


        if(this.currentAudio01 != null) this.currentAudio01.stop();
        if(this.currentAudio02 != null) this.currentAudio02.stop();

        console.log("timeline: ", this.timeLineAC, " ", this.timeLineBD);


        const current01 = this.timeLineAC[0];
        const current02 = this.timeLineBD[0];
        console.log("current: ", current01, " ", current02);
        switch (current01) {
            case AudioType.A:
                this.currentAudio01 =this.soundA;
                break;
            case AudioType.C:
                this.currentAudio01 = this.soundC;
                break;
            default:
                break;
        }
        switch (current02) {
            case AudioType.B:
                this.currentAudio02 = this.soundB;
                break;
            case AudioType.D:
                this.currentAudio02 = this.soundD;
                break;
            default:
                break;
        }


        this.currentAudio02.play();
        this.currentAudio01.play();
        this.soundBG.play();

        setTimeout(()=>{this.play();},4000);
    };


    onKeyDown=(e)=>
    {
        console.log(e);
        if(e.key == "1")
            this.timeLineAC.push(AudioType.A );
        if(e.key == "2")
            this.timeLineBD.push(AudioType.B );
        if(e.key == "3")
            this.timeLineAC.push(AudioType.C );
        if(e.key == "4")
            this.timeLineBD.push(AudioType.D );

        console.log("timeline: ", this.timeLineAC, " ", this.timeLineBD);

        if(e.key== "p")
            this.play();


        console.log(this.soundA.audio.isPlaying);
        console.log(this.soundA.audio.isPlaying);
        console.log(this.soundA.audio.isPlaying);
        console.log(this.soundA.audio.isPlaying);

    };
}

