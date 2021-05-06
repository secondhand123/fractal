/*
Idea: save array of data (iterations to escape, min dist to shape, etc.)
then, seperate kernel factory function in dev console to quickly iterate color
palette (save processing time)

Idea: 2*2 or 3*3 aa


intended zoom behavior is that the mouse stays in the same point in both screen
space and "world" space


*/
//define things
let zoom = 0.004;
let x = -2.2;
let y = -1.2;

var canvas = document.getElementById('canvas');
console.log(canvas);

document.onwheel = (e) => {
    //console.log(e.deltaY);
    let scr = e.deltaY;
    //scr=Math.sign(scr)*Math.log(Math.abs(scr))/40;
    scr<0?scr=8/9:scr=9/8;

    let dx = zoom*canvas.width;
    let dy = zoom*canvas.height;
    zoom*=scr;
    dx -=zoom*canvas.width;
    dy -=zoom*canvas.height



    x+= dx/(canvas.width/(e.x-8));//correct
    y+= dy/(canvas.height/(canvas.height-(e.y-8)));//two coordinate systems

    render(x,y,zoom);
}



//const ctx = canvas.getContext('2d');
var window = [0,0,1,1];//center, top-right

const gpu = new GPU({canvas:canvas});
console.log(gpu);
const kernel = gpu.createKernel(function() {
return this.thread.x;
}).setOutput([100]);
console.log(kernel());




const render = gpu.createKernel(function(x,y,z/*zoom*/){
    //remember: we are implicitly in a for loop iterating over the pixels, i,j -> this.thread.x,y;

    function squadd(z,c){//squareZ+addC
        return [((z[0]*z[0])-(z[1]*z[1]))+c[0],
                (z[0]*z[1]*2)+c[1]];
    };

//return z*this.thread.x;

    let dx = x + z*this.thread.x;
    let dy = y + z*this.thread.y;
    let Z = [0,0];
    let C = [dx,dy];
    for(var i = 0;i<340;i++){//mandelbrot
        Z = squadd(Z,C);
    }

    this.color(Z[1],Z[0]*Z[1],Z[0]-Z[1],1);
    //shade

    // if(Z[0]*Z[0]+Z[1]*Z[1]<4/*2*2*/){
    //     this.color(1,0,0,1);
    // }else{
    //     this.color(this.thread.y/840,1,1);
    // }





}).setPrecision("single").setTactic('precision').setLoopMaxIterations(10000).setOutput([window.innerWidth-16,window.innerHeight-16]).setGraphical(true);

//render(-2,-2,4/(window.innerHeight-16));
console.log(render(-2.2,-1.2,0.004));//
//render(0.3752158979765301,-0.21978047105783483,1.2914124478883029e-7);
