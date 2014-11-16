var vector, line;
(function(undef){

// vector object
vector = function(x,y){
  if(y===undef){
    if(x===undef){
      x = y = 0.0;
    }else{
      y = x.y!==undef?x.y:typeof x.lat==="function"?x.lat():0.0;
      x = x.x!==undef?x.x:typeof x.lng==="function"?x.lng():0.0;
    }
  }
  this.x = x-0.0;
  this.y = y-0.0;
};
vector.prototype = {
  copy:function(){
    return new vector(this.x, this.y);
  },
  add:function(v){
    return new vector(this.x+v.x, this.y+v.y);
  },
  sub:function(v){
    return v!==undef ? new vector(this.x-v.x, this.y-v.y) : new vector(-this.x,-this.y);
  },
  scale:function(d){
    return new vector(this.x*d, this.y*d);
  },
  dot:function(v){
    return this.x*v.x+this.y*v.y;
  },
  cross:function(v){
    return this.x*v.y-this.y*v.x;
  },
  dist:function(v){
    if(v===undef){ v = new vector(); }
    return Math.sqrt(Math.pow(this.x-v.x, 2)+Math.pow(this.y-v.y, 2));
  },
  latLng:function(){
    return new google.maps.LatLng(this.y, this.x);
  },
  toString:function(){
    return this.x+","+this.y;
  }
};

// line object
line = function(p0,p1){
  if(!(p0 instanceof vector)){ p0 = new vector(p0); }
  if(!(p1 instanceof vector)){ p1 = new vector(p1); }
  if(p0.x>p1.x){ var p=p0;p0=p1;p1=p; }
  this.p0 = p0.copy();
  this.p1 = p1.copy();
};
line.prototype = {
  copy:function(){
    return new line(this.p0, this.p1);
  },
  dist:function(v){
    var lv = this.p1.sub(this.p0);
    if(lv.dot(v.sub(this.p1))>0){ return v.sub(this.p1).dist(); }
    else if(lv.dot(v.sub(this.p0))<0){ return v.sub(this.p0).dist(); }
    return lv.cross(v.sub(this.p0))/lv.dist();
  },
  center:function(){
    return this.p0.add(this.p1).scale(0.5);
  }
};

})();
