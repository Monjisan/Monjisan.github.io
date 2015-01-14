var openstreetmap = (function(){

  var railFilter = function(){
    return $(this).find("tag[k=railway][v=rail]").length>0;
  };
  //var polyline=[];
  var ret = {
    // 更新
    load: function(pos, d, callback){
      var lb = pos.toLatLng(-d,-d), rt = pos.toLatLng(d,d);
      $.ajax({
        url:"http://api.openstreetmap.org/api/"+
        "0.6/map?bbox="+lb.lng()+","+lb.lat()+","+rt.lng()+","+rt.lat(),
        type:"GET",
        success:function(res){
          ret.dom = $(res);
          //************[draw map]************
          //polyline.forEach(function(a){ a.setMap(null); });
          //polyline = [];
          ret.rail = [];
          ret.dom.find("way").filter(railFilter).each(function(){
            var nd=[];
            $(this).find("nd").each(function(){
              var ndd=ret.dom.find("node[id="+
                $(this).attr("ref")+
                "]");
              nd.push(new google.maps.LatLng(
                ndd.attr("lat")-0,
                ndd.attr("lon")-0
              ));
            });
            /*polyline.push(new google.maps.Polyline({
              path:nd, strokeColor:"#000", map:googlemaps.map()
            }));*/
            ret.rail.push(nd.map(function(v){ return new latLng(v); }));
          });
          //************          ************
          callback();
        },
        error:function(e){ console.error('streetmap',e); }
      });
    },
    rail: [],
    station: [],
    dom: {}
  };
  
  
  return ret;
})();
