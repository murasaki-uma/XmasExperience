export  default class OnBeatPower {
    value = 0.0;
    nextValue = 0.0;
    constructor()
    {
        window.addEventListener( 'keydown', this.onKeyDown.bind(this), false );
    }

    onKeyDown = (e)=>
    {
        if(e.code == "Space")
            this.nextValue = 100.0;
    };

    public update()
    {
        this.nextValue += (1 - this.nextValue) * 0.1;
        this.value += (this.nextValue - this.value) * 0.1;
    }
}