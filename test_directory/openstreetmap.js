﻿var openstreetmap = (function(){

  // 路線・駅検索関数
  var railFilter = function(){
    return $(this).find("tag[k=railway][v=rail]").length>0;
  }, stationFilter = function(){
    return $(this).find("tag[k=railway][v=station]").length>0;// tag[k=building][v=train_station]
  };
  // 線路情報保持用コンストラクタ
  var railway = function(nodes, name){
    this.nodes = $.isArray(nodes)?nodes:[];
    this.name = ""+name;
  };
  // 名称取得関数
  var getName = function(a){
    return a.find("tag[k=name\\:ja]").attr("v") || a.find("tag[k=name]").attr("v");
  };
  var ret = {
    // 更新関数
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
          var stationmap = {}, usedStation = {};
          xml.find("node").filter(stationFilter).each(function(){
            var a = $(this);
            ret.station.push([new latLng(a.attr("lat")-0, a.attr("lon")-0), getName(a)]);
            stationmap[a.attr("id")] = ret.station.length-1;
          });
          // 線路取得
          xml.find("way").filter(railFilter).each(function(){
            var nd=[], st=[];
            $(this).find("nd").each(function(){
              var id = $(this).attr("ref"),
                  ndd = xml.find("node[id="+id+"]"),
                  sta = stationmap[id],
                  nddp = new latLng(ndd.attr("lat")-0, ndd.attr("lon")-0, id, {}, {}, sta);
              if(sta!==undefined){ usedStation[sta] = true; }
              nd.push(nddp);
            });
            ret.rail.push(new railway(nd, getName($(this)) ));
          });
          ret.station.forEach(function(a,ia){
            if(usedStation[ia]){ return; }
            var min = 1e10, minrail = -1, minnum = -1;
            ret.rail.forEach(function(b,ib){
              b.nodes.forEach(function(c,ic){
                var d = a[0].dist(c);
                if(d<min){
                  min = d;
                  minrail = ib;
                  minnum = ic;
                }
              });
            });
            if(minrail!==-1){
              ret.rail[minrail].nodes[minnum].station = ia;
            }
          });
          // 隣接線路の取得
          ret.rail.forEach(function(a,ia){
            var self = a;
            a.len = function(i, j){
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
                  var va = a[1].toXY(a[0]);
                  a[0].next[ib] = ic;
                  a[0].nextd[ib] = 
      (ic>0               &&va.dot(c.toXY(b.nodes[ic-1]))>0?-1:0)+
      (ic<b.nodes.length-1&&va.dot(c.toXY(b.nodes[ic+1]))>0? 1:0);
                  c.next[ia] = 0;
                  c.nextd[ia] = 1;
                }
                if(a[a.length-1].id === c.id){
                  var va = a[a.length-2].toXY(a[a.length-1]);
                  a[a.length-1].next[ib] = ic;
                  a[a.length-1].nextd[ib] = 
      (ic>0               &&va.dot(c.toXY(b.nodes[ic-1]))>0?-1:0)+
      (ic<b.nodes.length-1&&va.dot(c.toXY(b.nodes[ic+1]))>0? 1:0);
                  c.next[ia] = a.length-1;
                  c.nextd[ia] = -1;
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
    // 駅・路線情報
    rail: [],
    station: [],
  };
  
  
  return ret;
})();
