$(function () {
  const weekdaysJa = ["日", "月", "火", "水", "木", "金", "土"];
  const weekdaysEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekdays = navigator.language === "ja" ? weekdaysJa : weekdaysEn;

  const getTZText = (offset) => {
    const sign = offset <= 0 ? "+" : "-";
    const abs = Math.abs(offset);
    const hours = Math.floor(abs / 60);
    const minutes = abs % 60;
    const h = hours.toString().padStart(2, "0");
    const m = minutes.toString().padStart(2, "0");
    return `${sign}${h}:${m}`;
  };

  const R = 250;
  const center = [R, R];
  const calcCirclePos = (r, theta) =>
    [
      center[0] + R * r * Math.sin(Math.PI * 2 * theta),
      center[1] - R * r * Math.cos(Math.PI * 2 * theta),
    ].join(",");
  const centerPos = center.join(",");

  const updateTime = (d) => {
    const now = new Date();
    const tzoffset = now.getTimezoneOffset();
    const times = {
      h: now.getHours().toString().padStart(2, "0"),
      m: now.getMinutes().toString().padStart(2, "0"),
      s: now.getSeconds().toString().padStart(2, "0"),
      tz: getTZText(now.getTimezoneOffset()),
      Y: now.getFullYear(),
      M: (now.getMonth() + 1).toString().padStart(2, "0"),
      D: now.getDate().toString().padStart(2, "0"),
      DDD: weekdays[now.getDay()] || "",
    };
    const points = {
      h: calcCirclePos(0.5, now.getHours() / 12),
      m: calcCirclePos(0.75, now.getMinutes() / 60),
      s: calcCirclePos(0.85, now.getSeconds() / 60),
    };

    const setHandPoints = (targetName, p) => {
      $(
        `#clock-hand-${targetName}-shadow, #clock-hand-${targetName}-main`,
      ).attr("points", `${centerPos} ${p}`);
    };
    setHandPoints("h", points.h);
    setHandPoints("m", points.m);
    setHandPoints("s", points.s);

    $("#text-hm").text(`${times.h}:${times.m}`);
    $("#text-s").text(`:${times.s}`);
    $("#text-tz").text(times.tz);
    $("#text-date").text(`${times.Y}/${times.M}/${times.D} (${times.DDD})`);
  };

  window.setInterval(() => {
    updateTime();
  }, 500);
});
