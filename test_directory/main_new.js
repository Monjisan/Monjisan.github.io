window.addEventListener('load',function(){
  // �`�揀��
  var canvas = $('#my_map')[0];
  var ctx = canvas.getContext('2d');

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
    googlemaps.center(pos.toGoogle());
    center.setPosition(pos.toGoogle());
    
    // �\���ɗ��ꂽ��X�V
    if(pos.dist(prev)>d){
      openstreetmap.load(pos, d, function(){
        console.log("Get Map", openstreetmap.dom);
        
      });
    }
    
  });
  


  $("#fixed").click(function(){
    $(this).text((fixed=!fixed)?"�ړ��J�n":"���ݒn�Œ�");
  });
  $("#marker_fixed").click(function(){
    $(this).text((markerMove=!markerMove)?"�}�[�J�[�Œ�":"�}�[�J�[�ړ��J�n");
    //center.setDraggable(markerMove);
  });
  
});