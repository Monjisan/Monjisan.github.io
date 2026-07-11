$(function () {
  const enterFullscreen = (element) => {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  let formatText = undefined;
  const updateText = () => {
    const now = new Date();
    const times = {
      h: now.getHours().toString().padStart(2, "0"),
      m: now.getMonth().toString().padStart(2, "0"),
      s: now.getSeconds().toString().padStart(2, "0"),
    };
    $("#viewer").text(formatText.replaceAll(/\{[hms]\}/g, (p) => times[p[1]]));
  };
  window.setInterval(() => {
    if (formatText !== undefined) {
      updateText();
    }
  }, 500);

  const showFullscreen = () => {
    formatText = $("#text").val();
    updateText();
    $("#viewer").css("display", "flex");
    $("#editor").hide();
  };

  const hideFullscreen = () => {
    formatText = undefined;
    $("#viewer").hide();
    $("#editor").show();
  };

  $("#show-full-screen").on("click", () => {
    showFullscreen();

    // Androidではフルスクリーン
    // iPhoneでは失敗するのでそのまま擬似フルスクリーン
    enterFullscreen($("#viewer")[0]);
  });

  // タップで戻る
  $("#viewer").on("click", () => {
    exitFullscreen();
    hideFullscreen();
  });

  // Androidで戻るボタン等によりフルスクリーン解除された場合
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
      if ($("#viewer").is(":visible")) {
        hideFullscreen();
      }
    }
  });
});
