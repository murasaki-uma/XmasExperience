import * as THREE from 'three'
import Scene from "./Scene";
import {debug} from "util";
import {TweenMax, Power0} from "../../node_modules/gsap/TweenMax";
class AudioManager
{
    public audio:THREE.Audio;
    public duration:number;
    public isLoop:boolean = false;
    public time = {value:4.0};
    constructor(audioListener:THREE.AudioListener, buffer)
    {
        // @ts-ignore
        window.timer = this.time;
        this.audio = new THREE.Audio(audioListener);
        this.audio.setBuffer(buffer);
        this.audio.setLoop( false );
        this.audio.setVolume( 0.0);
        this.duration = Math.floor(buffer.duration);
        // console.log(this.duration);
        this.isLoop = false;
    }

    setVolume=(value:number)=>
    {
        this.audio.setVolume(value);
    };

    public stop()
    {
        this.audio.stop();
    }

    public play=()=>
    {

        if(this.audio.isPlaying) this.audio.stop();
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
    volume = {value:0.0};
    isStart:boolean = false;
    constructor(scene:THREE.Scene,camera:THREE.PerspectiveCamera)
    {

        // @ts-ignore
        window.onLoadCount = 0.0;
        this.listener = new THREE.AudioListener();
        camera.add( this.listener );
        this.audioLoader = new THREE.AudioLoader();
        // @ts-ignore

        this.audioLoader.load( 'https://murasaki-uma.github.io/XmasExperienceAssets/music/A.mp3', ( buffer )=> {
            this.soundA = new AudioManager(this.listener,buffer);
            // @ts-ignore
            window.onLoadCount += 1;
            // this.soundA.play();
        });
        // @ts-ignore

        this.audioLoader.load( 'https://murasaki-uma.github.io/XmasExperienceAssets/music/B.mp3', ( buffer )=> {
            this.soundB = new AudioManager(this.listener,buffer);
            // @ts-ignore
            window.onLoadCount += 1;
        });
        // @ts-ignore

        this.audioLoader.load( 'https://murasaki-uma.github.io/XmasExperienceAssets/music/C.mp3', ( buffer )=> {
            this.soundC = new AudioManager(this.listener,buffer);
            // @ts-ignore
            window.onLoadCount += 1;
        });
        // @ts-ignore

        this.audioLoader.load( 'https://murasaki-uma.github.io/XmasExperienceAssets/music/D.mp3', ( buffer )=> {
            this.soundD = new AudioManager(this.listener,buffer);
            // @ts-ignore
            window.onLoadCount += 1;
        });
        // @ts-ignore

        this.audioLoader.load( 'https://murasaki-uma.github.io/XmasExperienceAssets/music/BG.mp3', ( buffer )=> {
            this.soundBG = new AudioManager(this.listener,buffer);
            // @ts-ignore
            window.onLoadCount += 1;
        });
        // @ts-ignore

        this.audioLoader.load( 'https://murasaki-uma.github.io/XmasExperienceAssets/music/FX.mp3', ( buffer )=> {
            this.soundFX = new AudioManager(this.listener,buffer);
            // @ts-ignore
            window.onLoadCount += 1;
        });

        this.timeLineAC.push(AudioType.A);
        this.timeLineBD.push(AudioType.D);
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener( 'click', this.onClick.bind(this), false );
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



    public play=()=>
    {

        if(!this.isStart)
        {
            TweenMax.to(this.volume, 3 ,{value:0.1 ,
                // onUpdate:()=>{
                //
                // }
            });
            this.isStart = true;
        }
        // this.soundA.setVolume(this.volume.value);
        // this.soundB.setVolume(this.volume.value);
        // this.soundC.setVolume(this.volume.value);
        // this.soundD.setVolume(this.volume.value);
        // this.soundBG.setVolume(this.volume.value);
        // this.soundFX.setVolume(this.volume.value);

        if(this.timeLineAC.length > 1) this.timeLineAC.shift();
        if(this.timeLineBD.length > 1) this.timeLineBD.shift();


        if(this.currentAudio01 != null) this.currentAudio01.stop();
        if(this.currentAudio02 != null) this.currentAudio02.stop();

        console.log("timeline: ", this.timeLineAC, " ", this.timeLineBD);


        const current01 = this.timeLineAC[0];
        const current02 = this.timeLineBD[0];
        // console.log("current: ", current01, " ", current02);
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

        // @ts-ignore
        window.timer.value = 4.0;
        // @ts-ignore
        TweenMax.to(window.timer, 4.0, {value:0.0, onComplete:()=>{this.play();}});
        // setTimeout(()=>{this.play();},4000);
    };


    onKeyDown=(e)=>
    {
        console.log(e);
        // if(e.key == "ArrowRight")
        //     this.timeLineAC.push(AudioType.A );
        // if(e.key == "ArrowLeft")
        //     this.timeLineAC.push(AudioType.C );
        // if(e.key == "ArrowUp")
        //     this.timeLineBD.push(AudioType.B );
        // if(e.key == "ArrowDown")
        //     this.timeLineBD.push(AudioType.D );


        if(e.key== "p")
            this.play();

        if(e.code == "Space")
            this.soundFX.play();


        // console.log(this.soundA.audio.isPlaying);
        // console.log(this.soundA.audio.isPlaying);
        // console.log(this.soundA.audio.isPlaying);
        // console.log(this.soundA.audio.isPlaying);

    };

    update()
    {
        this.soundA.setVolume(this.volume.value);
        this.soundB.setVolume(this.volume.value);
        this.soundC.setVolume(this.volume.value);
        this.soundD.setVolume(this.volume.value);
        this.soundBG.setVolume(this.volume.value);
        this.soundFX.setVolume(this.volume.value);
    }

    onClick=(e)=>
    {
        let isAC = false;
        let isBD = false;
        if(this.timeLineAC.length < 2) isAC = true;
        if(this.timeLineBD.length < 2) isBD = true;


        if(isAC && isBD)
        {
            if(Math.random() < 0.5)
            {
                this.timeLineAC.push(this.timeLineAC[0] ==AudioType.A ? AudioType.C : AudioType.A);
            } else
            {
                this.timeLineBD.push(this.timeLineBD[0] ==AudioType.B ? AudioType.D : AudioType.B)
            }
        } else
        if(isAC)
        {
            this.timeLineAC.push(this.timeLineAC[0] ==AudioType.A ? AudioType.C : AudioType.A);
        } else
        {
            this.timeLineBD.push(this.timeLineBD[0] ==AudioType.B ? AudioType.D : AudioType.B)
        }

        console.log("timeline: ", this.timeLineAC, " ", this.timeLineBD);

        // this.soundFX.play();
    };
}

