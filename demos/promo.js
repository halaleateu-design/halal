(function () {
  function init() {
    var root = document.querySelector("[data-promo]");
    if (!root) return;

    var slides = Array.prototype.slice.call(root.querySelectorAll(".promo-slide"));
    var progress = root.querySelector("[data-progress]");
    var playBtn = root.querySelector("[data-play]");
    var dotsWrap = root.querySelector("[data-dots]");
    var shareBtn = root.querySelector("[data-share]");
    var duration = Number(root.getAttribute("data-ms") || 4500);
    var i = 0;
    var playing = true;
    var started = performance.now();

    slides.forEach(function (_, n) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Scene " + (n + 1));
      if (n === 0) b.classList.add("is-on");
      b.addEventListener("click", function () {
        go(n);
      });
      dotsWrap.appendChild(b);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);

    function go(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (el, idx) {
        el.classList.toggle("is-on", idx === i);
      });
      dots.forEach(function (el, idx) {
        el.classList.toggle("is-on", idx === i);
      });
      started = performance.now();
      if (progress) progress.style.width = "0%";
    }

    playBtn.addEventListener("click", function () {
      playing = !playing;
      playBtn.textContent = playing ? "Pause" : "Play";
      if (playing) {
        var w = parseFloat(progress.style.width) || 0;
        started = performance.now() - (w / 100) * duration;
      }
    });

    root.querySelector("[data-restart]").addEventListener("click", function () {
      playing = true;
      playBtn.textContent = "Pause";
      go(0);
    });

    if (shareBtn) {
      shareBtn.addEventListener("click", async function () {
        var url = location.href;
        try {
          if (navigator.share) {
            await navigator.share({
              title: "EatHalal / GO — Halal food near you",
              text: "Order verified halal food in Porto — GO by EatHalal.",
              url: url
            });
          } else {
            await navigator.clipboard.writeText(url);
            shareBtn.textContent = "Link copied";
            setTimeout(function () {
              shareBtn.textContent = "Share";
            }, 1600);
          }
        } catch (e) {}
      });
    }

    function tick(now) {
      if (playing) {
        var t = now - started;
        var p = Math.min(1, t / duration);
        if (progress) progress.style.width = p * 100 + "%";
        if (p >= 1) go(i + 1);
      }
      requestAnimationFrame(tick);
    }

    go(0);
    requestAnimationFrame(tick);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
