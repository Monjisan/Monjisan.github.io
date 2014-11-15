var vector;
(function(undef){

vector = function(x,y){
  if(y===undef){
    if(x===undef){
      x = y = 0.0;
    }else{
      y = x.y;
      x = x.x;
    }
  }
  this.x = x;
  this.y = y;
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
  dot:function(v){
    return this.x*v.x+this.y*v.y;
  },
  cross:function(v){
    return this.x*v.y-this.y*v.x;
  },
  dist:function(v){
    return Math.sqrt(Math.pow(this.x-v.x, 2)+Math.por(this.y-v.y, 2));
  },
  latLng:function(){
    return new google.maps.LatLng(this.y, this.x);
  },
  toString:function(){
    return this.x+","+this.y;
  }
};

})();
