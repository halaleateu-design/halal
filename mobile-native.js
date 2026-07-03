/**
 * EatHalal GO — Capacitor native bootstrap (Android / iOS WebView).
 */
(function () {
  function isNative() {
    try {
      return window.Capacitor?.isNativePlatform?.() === true;
    } catch {
      return false;
    }
  }

  function boot() {
    if (!isNative()) return;

    if (window.GOSite) window.GOSite.isNativeApp = true;
    document.documentElement.classList.add("go-native-app");

    var plugins = window.Capacitor?.Plugins || {};
    var splash = plugins.SplashScreen;
    if (splash?.hide) splash.hide().catch(function () {});

    var statusBar = plugins.StatusBar;
    if (statusBar?.setStyle) statusBar.setStyle({ style: "DARK" }).catch(function () {});
    if (statusBar?.setBackgroundColor) {
      statusBar.setBackgroundColor({ color: "#0d3d2e" }).catch(function () {});
    }

    var app = plugins.App;
    if (app?.addListener) {
      app.addListener("backButton", function (ev) {
        if (ev.canGoBack) {
          history.back();
          return;
        }
        var page = (location.pathname.split("/").pop() || "app.html").split("?")[0];
        if (page !== "app.html") {
          location.href = "app.html";
          return;
        }
        if (app.exitApp) app.exitApp();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
