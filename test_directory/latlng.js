var latLng = (function(){
  // コンストラクタ
  var ret = function(){
    if(arguments.length>=2){
      this.t = arguments[0];
      this.g = arguments[1];
    }else if(arguments.length===1){
      if(typeof arguments[0].lat === typeof [].join){
        this.t = arguments[0].lat();
        this.g = arguments[0].lng();
      }else if(typeof arguments[0].latitude === typeof 0.0){
        this.t = arguments[0].latitude;
        this.g = arguments[0].longitude;
      }else{
        this.t = 0.0;
        this.g = 0.0;
      }
    }else{
      this.t = 0.0;
      this.g = 0.0;
    }
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
    // google maps 用変換
    toGoogle: function(){
      return new google.maps.LatLng(this.lat(), this.lng());
    },
    // 距離加算
    toLatLng: function(x,y){
      var dlat = y*360.0/latLng.latitude_, dlng = x*360.0/latLng.lontitude_ / Math.cos(dlat*Math.PI/180)
      return new latLng(this.lat()+dlat, this.lng()+dlng);
    },
    // 距離換算
    toXY: function(p){
      var y = (p.lat()-this.lat())*latLng.latitude_ /360.0;
      var x = (p.lng()-this.lng())*latLng.lontitude_/360.0 * Math.cos((p.lat()+this.lat())/2*Math.PI/180);
      return {x:x, y:y};
    }
  };
  ret.latitude_  = 40076.5;
  ret.lontitude_ = 40008.6;

  return ret;
})();
