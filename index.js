$(function(){
  var tabID = 'tab0';

  function chageTab(){
    var ID = $(this).attr('id');
    if(ID!=tabID){
      $('.tabItem#'+tabID).removeClass('selectTab');
      $(this).addClass('selectTab');
      $('.contents#'+tabID+'Contents').css('display','none');
      $('.contents#'+ID+'Contents').css('display','');
      tabID = ID;
    }
  }

  $('.tabItem').click(chageTab);
  $('a').each(function(){
    if($(this).attr('href').indexOf('http')==0){
      $(this).attr('target', '_blank').append('<span class="comments">[外部リンク]</span>');
    }
  });
});