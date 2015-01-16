// ベクトル計算
var vector = (function(){
  var ret = function(x,y){
    this.x = x;
    this.y = y;
  };
  ret.prototype = {
    add:function(v){
    return new vector(this.x+v.x, this.y+v.y);
    },
    sub:function(){
      return arguments.length===1 ? new vector(this.x-arguments[0].x, this.y-arguments[0].y) : new vector(-this.x,-this.y);
    },
    scale:function(d){
      return new vector(this.x*d, this.y*d);
    },
    dot: function(v){
      return this.x*v.x+this.y*v.y;
    },
    cross:function(v){
      return this.x*v.y-this.y*v.x;
    },
    dist:function(){
      if(arguments.length===0) return Math.sqrt(Math.pow(this.x, 2)+Math.pow(this.y, 2));
      return Math.sqrt(Math.pow(this.x-arguments[0].x, 2)+Math.pow(this.y-arguments[0].y, 2));
    }
  };
  return ret;
})();

// GPS座標計算
var latLng = (function(){
  // コンストラクタ
  var ret = function(){
    var lat, lng;
    lat = 0.0;
    lng = 0.0;
    if(arguments.length>=2){
      lat = arguments[0];
      lng = arguments[1];
    }else if(arguments.length===1){
      if(typeof arguments[0].lat === typeof [].join){
        lat = arguments[0].lat();
        lng = arguments[0].lng();
      }else if(typeof arguments[0].latitude === typeof 0.0){
        lat = arguments[0].latitude;
        lng = arguments[0].longitude;
      }else{
        lat = 0.0;
        lng = 0.0;
      }
    }
    this.g = lng;
    this.t = lat;
    this.id = arguments[2]; // openstreetmap用
    this.next = arguments[3]; // openstreetmap用
  };
  
  // メソッド
  ret.prototype = {
    // 座標
    lat: function(){
      if(arguments.length===0){
        return this.t;
      }else{
        this.t = arguments[0];
        return this;
      }
    },
    lng: function(){
      if(arguments.length===0){
        return this.g;
      }else{
        this.g = arguments[0];
        return this;
      }
    },
    // 距離取得関数
    dist: function(p){
      var d = this.toXY(p);
      return Math.sqrt(Math.pow(d.y,2)+Math.pow(d.x,2));
    },
    // 線分l1,l2までの距離
    distToLine: function(l1, l2){
      l1 = this.toXY(l1);
      l2 = this.toXY(l2);
      var lv = l2.sub(l1);
      if(lv.dot(l1)>0){ return l1.dist(); }
      else if(lv.dot(l2)<0){ return l2.dist(); }
      return Math.abs(lv.cross(l1))/lv.dist();
    },
    nearestPos: function(l1, l2){
      l1 = this.toXY(l1);
      l2 = this.toXY(l2);
      var lv = l2.sub(l1);
      if(lv.dot(l1)>0){ return l1; }
      else if(lv.dot(l2)<0){ return l2; }
      return l1.add( lv.scale(-l1.dot(lv)/lv.dot(lv)) );
    },
    // google maps 用変換
    toGoogle: function(){
      return new google.maps.LatLng(this.lat(), this.lng());
    },
    // 距離加算
    toLatLng: function(x,y){
      var dlat = y*360.0/ret.latitude_, dlng = x*360.0/ret.lontitude_ / Math.cos(dlat*Math.PI/180)
      return new ret(this.lat()+dlat, this.lng()+dlng);
    },
    // 距離換算
    toXY: function(p){
      var y = (p.lat()-this.lat())*ret.latitude_ /360.0;
      var x = (p.lng()-this.lng())*ret.lontitude_/360.0 * Math.cos((p.lat()+this.lat())/2*Math.PI/180);
      return new vector(x,y);
    }
  };
  ret.latitude_  = 40076.5;
  ret.lontitude_ = 40008.6;

  return ret;
})();
