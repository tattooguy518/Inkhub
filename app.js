document.addEventListener("DOMContentLoaded", () => {
  const sideNav = document.getElementById("sideNav");
  const menuToggle = document.getElementById("menuToggle");
  const closeNav = document.getElementById("closeNav");
  const backdrop = document.getElementById("backdrop");
  const navItems = Array.from(document.querySelectorAll(".nav-item"));
  const pages = Array.from(document.querySelectorAll(".page"));
  const tabButtons = Array.from(document.querySelectorAll(".tab-button"));
  const tabContents = Array.from(document.querySelectorAll(".tab-content"));

  /* Navigation helpers */

  function openNav() {
    if (!sideNav) return;
    sideNav.classList.add("open");
    backdrop.classList.add("visible");
  }

  function closeSideNav() {
    if (!sideNav) return;
    sideNav.classList.remove("open");
    backdrop.classList.remove("visible");
  }

  function setActivePage(targetId) {
  // Switch visible page
  pages.forEach((page) => {
    page.classList.toggle("active", page.id === targetId);
  });

  // Update nav highlight
  navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.target === targetId);
  });

  // 🔹 Reset scroll so the new page starts at the top
  window.scrollTo({
    top: 0,
    behavior: "smooth"   // change to "auto" if you want it instant
  });
}

  /* Event wiring */

  if (menuToggle) {
    menuToggle.addEventListener("click", openNav);
  }

  if (closeNav) {
    closeNav.addEventListener("click", closeSideNav);
  }

  if (backdrop) {
    backdrop.addEventListener("click", closeSideNav);
  }

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const targetId = item.dataset.target;
      if (!targetId) return;
      setActivePage(targetId);

      // Close side nav on small screens
      if (window.innerWidth < 960) {
        closeSideNav();
      }
    });
  });

  /* Tab handling */

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabName = btn.dataset.tab;
      const parentTabs = btn.closest(".tabs");
      if (!tabName || !parentTabs) return;

      const tabsKey = parentTabs.dataset.tabs;

      // Toggle active tab buttons within this group
      parentTabs.querySelectorAll(".tab-button").forEach((childBtn) => {
        childBtn.classList.toggle("active", childBtn === btn);
      });

      // Toggle tab contents within this group
      document
        .querySelectorAll(`.tab-content[data-tab-panel]`)
        .forEach((panel) => {
          const panelElement = panel;
          const panelKey = panelElement.dataset.tabPanel;

          const isInThisGroup = panelElement.closest("section")?.contains(parentTabs);
          if (!isInThisGroup) return;

          panelElement.classList.toggle("active", panelKey === tabName);
        });
    });
  });

  /* PWA: register service worker */

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("service-worker.js")
      .catch((err) => {
        console.warn("Service worker registration failed:", err);
      });
  }
});
