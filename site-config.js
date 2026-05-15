/**
 * GO — halal marketplace (Halal eat EU)
 */
(function () {
  const SITE = {
    brandName: "GO",
    brandLegal: "HalalEat EU",
    brandTagline: "Halal eat EU",
    businessEmail: "halaleateu@gmail.com",
    websiteUrl: "https://fanciful-moxie-6b5bba.netlify.app/",
    apiBaseUrl: "https://halall-dm79.onrender.com/api/v1",,
    social: {
      instagram: "https://www.instagram.com/eathalaleu/",
      tiktok: "https://www.tiktok.com/@eathalaleu",
    },
    maps: {
      label: "Porto, Portugal",
      lat: 41.1579,
      lng: -8.6291,
      embedUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3004.5!2d-8.6291!3d41.1579!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd2465abc4e1e6e1%3A0x6f7d3298cfeab114!2sPorto!5e0!3m2!1sen!2spt!4v1",
      directionsUrl:
        "https://www.google.com/maps/search/?api=1&query=Porto%2C+Portugal",
      placeId: "",
    },
    app: {
      androidPackage: "eu.halaleat.go.app",
      iosBundle: "eu.halaleat.go.app",
    },
  };

  window.GOSite = SITE;
  window.TayySite = SITE;
  window.EatHalalSite = SITE;
  window.HalalEatSite = SITE;

  function applyGOSiteConfig() {
    const mapsLink = document.getElementById("maps-directions-link");
    const mapsEmbed = document.getElementById("maps-embed");
    if (mapsLink && SITE.maps.directionsUrl) mapsLink.href = SITE.maps.directionsUrl;
    if (mapsEmbed && SITE.maps.embedUrl) mapsEmbed.src = SITE.maps.embedUrl;

    document.querySelectorAll("[data-brand-name]").forEach((el) => {
      el.textContent = SITE.brandName;
    });
    document.querySelectorAll("[data-brand-tagline]").forEach((el) => {
      el.textContent = SITE.brandTagline;
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyGOSiteConfig);
  } else {
    applyGOSiteConfig();
  }
})();
