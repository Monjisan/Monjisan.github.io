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
      var y = (this.lat()-p.lat())*latLng.latitude_ /360.0;
      var x = (this.lng()-p.lng())*latLng.lontitude_/360.0 * Math.cos((this.lat()-p.lat())*Math.PI/180);
      return Math.sqrt(Math.pow(y,2)+Math.pow(x,2));
    },
    // google maps 用変換
    toGoogle: function(){
      return new google.maps.LatLng(this.t, this.g);
    }
  };
  ret.latitude_  = 40076.5;
  ret.lontitude_ = 40008.6;

  return ret;
})();
