window.addEventListener('load',function(){
  // �`�揀��
  var canvas = $('#my_map')[0];
  var ctx = canvas.getContext('2d');
  var width = canvas.width = canvas.height = 500;
  var w2 = width/2;

  // google maps����
  googlemaps.makeMap($('#map_canvas')[0]);
  
  // GPS�Ăяo���J�n
  var d = 500.0/1000.0;
  var fixed = true, markerMove = false;
  var center = googlemaps.makeMarker();
  gps.on(function(pos, prev){
    // ���W�̕\��
    console.log("Get Pos", pos);
    $("#gps").append(pos.lat()+','+pos.lng()+'<br>');
    // ���W�Ɉړ�
    if(fixed)googlemaps.center(pos.toGoogle());
    center.setPosition(pos.toGoogle());
    
    
    ctx.clearRect(0,0,width,width);
    ctx.fillText("test",10,10);
    openstreetmap.rail.forEach(function(a){
      ctx.beginPath();
      a.forEach(function(b){
        b = pos.toXY(new latLng(b));
        ctx.lineTo(w2+w2*b.x/d, w2+w2*b.y/d);
      });
      ctx.stroke();
    });
    
    // �\���ɗ��ꂽ��X�V
    if(pos.dist(prev)>d){
      openstreetmap.load(pos, d, function(){
        console.log("Get Map", openstreetmap.dom);
        
      });
    }
    
  });
  


  $("#fixed").click(function(){
    $(this).text((fixed=!fixed)?"�ړ��J�n":"���ݒn�Œ�");
    if(fixed)googlemaps.center(gps.pos.toGoogle());
  });
  $("#marker_fixed").click(function(){
    $(this).text((markerMove=!markerMove)?"�}�[�J�[�Œ�":"�}�[�J�[�ړ��J�n");
    //center.setDraggable(markerMove);
  });
  
});