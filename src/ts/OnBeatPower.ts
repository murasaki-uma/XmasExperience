export  default class OnBeatPower {
    value = 0.0;
    nextValue = 0.0;
    constructor()
    {
        window.addEventListener( 'click', this.onClick.bind(this), false );
    }

    onClick = (e)=>
    {
        this.nextValue = 100.0;
    };

    public update()
    {
        this.nextValue += (1 - this.nextValue) * 0.1;
        this.value += (this.nextValue - this.value) * 0.1;
    }
}