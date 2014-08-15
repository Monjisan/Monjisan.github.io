$(function(){
  var canvas, ctx, w, h;
  var tentacles = [];
  canvas = $('canvas')[0];
  
  if(!canvas || !canvas.getContext ||
      !(ctx = canvas.getContext('2d'))){
    return;
  }
  
  canvas.width  = w = 600;
  canvas.height = h = 600;
  
  function Tentacle(x,y,c,r,wi,t,s){
    this.x = x;
    this.y = y;
    this.c = c;
    this.r = r;
    this.w = wi;
    this.t = t;
    this.s = s;
    console.log(this.c);
  }
  Tentacle.time = 0;
  Tentacle.prototype.draw = function(){
    var x,y,b;
    ctx.strokeStyle = this.c;
    ctx.lineWidth = this.w;
    ctx.beginPath()
    ctx.moveTo(x=this.x, y=this.y);
    b = 0;
    for(var i=0;i<100;++i){
      b = Math.sin((i+Tentacle.time+this.t)*this.s/Math.PI/2)
      x += this.r*Math.sin(b);
      y -= this.r*Math.cos(b);
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  };
  Tentacle.tick = function(){
    Tentacle.time++;
  };
  Tentacle.drawInit = function(){
    ctx.lineCap = 'round';
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#000';
  };
  
  
  for(var i=0;i<10;++i){
    tentacles.push(new Tentacle(Math.random()*w, h,
      '#'+(Math.random()*16|0).toString(16)+(Math.random()*16|0).toString(16)+(Math.random()*16|0).toString(16),
      Math.random()*4+2|0, Math.random()*10+10|0, Math.random()*180, Math.random()*0.9+0.1));
  }
  
  function tick(){
    ctx.fillStyle = '#fff';
    ctx.fillRect(0,0,w,h);
    Tentacle.drawInit();
    for(var i=0;i<tentacles.length;++i){
      tentacles[i].draw();
    }
    Tentacle.tick();
    setTimeout(tick, 50);
  }
  tick();
});