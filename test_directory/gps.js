var gps = (function(){
  // 使用可能かどうか
  if(navigator.geolocation){
  }else{
    return {};
  }

  // 返すオブジェクト
  var listener = [];
  var ret = {
    on: function(f){
      if(typeof f==="function"){ listener.push(f); }
    },
    pos: new latLng(),
    event: {},
    prevPos: new latLng(),
    prevEvent: {}
  };
  
  
  
  // GPS監視
  var successCB = function(e){
    ret.prevPos = ret.pos;
    ret.prevEvent = ret.event;
    ret.pos = new latLng(e.coords);
    ret.event = e;
    listener.forEach(function(a){ a(ret.pos, ret.prevPos); });
  }, errorCB = function(e){
    console.error('GPS callback',e);
  };
  // setTimeout type
  var getfunc = function(){
    navigator.geolocation.getCurrentPosition(successfunc, errorCB);
  }, successfunc = function(e){
    try{
      successCB(e);
    }catch(err){
      console.error('GPS event callback',err);
    }
    setTimeout(getfunc, 250);
  };
  getfunc();
  /* watchPosition type
  navigator.geolocation.watchPosition(successCB,errorCB,{
    enableHighAccuracy: true,
    timeout : 1000,
   maximumAge: 0
  });*/
  
  return ret;
})();
