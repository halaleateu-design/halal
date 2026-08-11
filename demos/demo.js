(function () {
  function initDemo(root) {
    if (!root) return;

    var scenes = Array.prototype.slice.call(root.querySelectorAll(".go-scene"));
    var caption = root.querySelector("[data-caption]");
    var stepEl = root.querySelector("[data-step]");
    var titleEl = root.querySelector("[data-title]");
    var bodyEl = root.querySelector("[data-body]");
    var progress = root.querySelector("[data-progress]");
    var playBtn = root.querySelector("[data-play]");
    var dotsWrap = root.querySelector("[data-dots]");
    var duration = Number(root.getAttribute("data-step-ms") || 4200);

    if (!scenes.length) return;

    var index = 0;
    var playing = true;
    var started = performance.now();
    var raf = 0;

    scenes.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", "Go to step " + (i + 1));
      if (i === 0) dot.classList.add("is-on");
      dot.addEventListener("click", function () {
        goTo(i, true);
      });
      dotsWrap.appendChild(dot);
    });

    var dots = Array.prototype.slice.call(dotsWrap.children);

    function renderCaption(i) {
      var s = scenes[i];
      stepEl.textContent = "Step " + (i + 1) + " / " + scenes.length;
      titleEl.textContent = s.getAttribute("data-title") || "";
      bodyEl.textContent = s.getAttribute("data-body") || "";
      caption.classList.remove("is-swap");
      void caption.offsetWidth;
      caption.classList.add("is-swap");
    }

    function goTo(i, user) {
      index = (i + scenes.length) % scenes.length;
      scenes.forEach(function (el, n) {
        el.classList.toggle("is-active", n === index);
      });
      dots.forEach(function (el, n) {
        el.classList.toggle("is-on", n === index);
      });
      renderCaption(index);
      started = performance.now();
      if (progress) progress.style.width = "0%";
      if (user && !playing) {
        /* stay paused */
      }
    }

    function tick(now) {
      if (!playing) {
        raf = requestAnimationFrame(tick);
        return;
      }
      var t = now - started;
      var p = Math.min(1, t / duration);
      if (progress) progress.style.width = p * 100 + "%";
      if (p >= 1) {
        goTo(index + 1, false);
      }
      raf = requestAnimationFrame(tick);
    }

    playBtn.addEventListener("click", function () {
      playing = !playing;
      playBtn.textContent = playing ? "Pause" : "Play";
      playBtn.setAttribute("aria-pressed", playing ? "true" : "false");
      if (playing) started = performance.now() - (parseFloat(progress.style.width) / 100) * duration;
    });

    root.querySelector("[data-restart]").addEventListener("click", function () {
      goTo(0, true);
      playing = true;
      playBtn.textContent = "Pause";
    });

    goTo(0, false);
    raf = requestAnimationFrame(tick);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initDemo(document.querySelector("[data-go-demo]"));
  });
})();
