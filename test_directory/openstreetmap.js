var openstreetmap = (function(){
  var ret = {
    // 更新
    load: function(pos, callback){
      var y = pos.lat(), x = pos.lng();
      var d = 500.0 / 1000.0; // 半径500メートル
      var dy = d*360.0/latLng.latitude_, dx = d*360.0/latLng.lontitude_ / Math.cos(dy*Math.PI/180)
      $.ajax({
        url:"http://api.openstreetmap.org/api/"+
        "0.6/map?bbox="+(x-dx)+","+(y-dy)+","+(x+dx)+","+(y+dy),
        type:"GET",
        success:function(res){
          openstreetmap.dom = $(res);
          callback();
        },
        error:function(e){ console.error('streetmap',e); }
      });
    },
    dom: {}
  };
  
  
  return ret;
})();
