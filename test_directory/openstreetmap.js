var openstreetmap = (function(){

  var railFilter = function(){
    return $(this).find("tag[k=railway][v=rail]").length>0;
  }, stationFilter = function(){
    return $(this).find("tag[k=railway][v=station]").length>0;// tag[k=building][v=train_station]
  };
  //var polyline=[];
  var railway = function(nodes, station, name){
    this.nodes = $.isArray(nodes)?nodes:[];
    this.station = $.isArray(station)?nodes:[];
    this.name = ""+name;
  };
  var ret = {
    // 更新
    load: function(pos, d, callback){
      var lb = pos.toLatLng(-d,-d), rt = pos.toLatLng(d,d);
      $.ajax({
        url:"http://api.openstreetmap.org/api/"+
        "0.6/map?bbox="+lb.lng()+","+lb.lat()+","+rt.lng()+","+rt.lat(),
        type:"GET",
        success:function(res){
          var xml = $(res).find("osm");
          //var nodes = xml.find("node");
          //************[draw map]************
          //polyline.forEach(function(a){ a.setMap(null); });
          //polyline = [];
          ret.rail = [];
          // 駅取得
          var stationmap = {};
          xml.find("node").filter(stationFilter).each(function(){
            var a = $(this);
            ret.station.push([new latLng(a.attr("lat")-0, a.attr("lon")-0), a.find("tag[k=name]").attr("v")]);
            stationmap[a.attr("id")] = ret.station.length-1;
          });
          // 線路取得
          xml.find("way").filter(railFilter).each(function(){
            var nd=[], st=[];
            $(this).find("nd").each(function(){
              var id = $(this).attr("ref"),
                  ndd = xml.find("node[id="+id+"]"),
                  nddp = new latLng(ndd.attr("lat")-0, ndd.attr("lon")-0, id, {}, stationmap[id]);
              st.push(ret.station.reduce(function(a,b,index){
                if(nddp.dist(b[0])){ return index; }
                return a;
              }), null);
              nd.push(nddp);
            });
            /*polyline.push(new google.maps.Polyline({
              path:nd, strokeColor:"#000", map:googlemaps.map()
            }));*/
            ret.rail.push(new railway(nd, st, $(this).find("tag[k=name]").attr("v")));
          });
          // 隣接線路の取得
          ret.rail.forEach(function(a,ia){
            var self = a;
            a.len = function(i,j){
              return Math.abs(self.lend[i]-self.lend[j]);
            }; // 距離累積計算
            a.lend = [0];
            a.nodes.forEach(function(b,ib){
              if(ib>0)a.lend.push(a.lend[ib-1]+
                    a.nodes[ib-1].dist(b));
            });
            a = a.nodes; // 隣接取得
            ret.rail.forEach(function(b,ib){
              if(ia===ib){ return; }
              b.nodes.forEach(function(c,ic){
                if(a[0].id === c.id){
                  a[0].next[ib] = ic;
                  c.next[ia] = 0;
                }
                if(a[a.length-1].id === c.id){
                  a[a.length-1].next[ib] = ic;
                  c.next[ia] = a.length-1;
                }
              });
            });
          });
          //************          ************
          callback();
        },
        error:function(e){ console.error('streetmap',e); }
      });
    },
    rail: [],
    station: [],
  };
  
  
  return ret;
})();
