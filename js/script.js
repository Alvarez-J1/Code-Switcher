//CopyCode

const DESKTOP_NAVIGATION_QUERY = "(min-width: 1050px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function updateCopyStatus(message) {
  const copyStatus = document.querySelector("#copy-status");

  if (!copyStatus) {
    return;
  }

  copyStatus.textContent = "";
  setTimeout(() => {
    copyStatus.textContent = message;
  }, 0);
}

function copyCode() {
  const activeCode = document.querySelector(
    ".code-container__code--active code",
  );

  if (!activeCode) {
    updateCopyStatus("No active code block is available to copy.");
    console.error("No active code block found to copy.");
    return;
  }

  const text = activeCode.textContent; // textContent gets all the text inside an element.

  if (!navigator.clipboard?.writeText) {
    updateCopyStatus("Clipboard access is not available.");
    console.error("Clipboard API is not available.");
    return;
  }

  navigator.clipboard
    .writeText(text)
    .then(() => {
      updateCopyStatus("Code copied to clipboard.");
      alert("Code copied!");
    })
    .catch((err) => {
      updateCopyStatus("Unable to copy code.");
      console.error("Failed to copy:", err);
    });
}

document.addEventListener("DOMContentLoaded", function () {
  const mobileMenuButton = document.querySelector(".mobile-menu-icon");
  const nav = document.querySelector(".header__nav");
  const copyButton = document.querySelector(".copy-icon");
  const tabs = document.querySelectorAll(".code-container__tab");
  const codeBlocks = document.querySelectorAll(".code-container__code");
  const tabList = Array.from(tabs);
  const supportsMatchMedia = typeof window.matchMedia === "function";

  if (mobileMenuButton && nav) {
    const setMobileMenuExpanded = (isOpen) => {
      nav.classList.toggle("active", isOpen);
      mobileMenuButton.setAttribute("aria-expanded", String(isOpen));
      mobileMenuButton.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu",
      );
    };

    const closeMobileMenu = () => {
      setMobileMenuExpanded(false);
    };

    mobileMenuButton.addEventListener("click", function () {
      setMobileMenuExpanded(!nav.classList.contains("active"));
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape" || !nav.classList.contains("active")) {
        return;
      }

      closeMobileMenu();
      mobileMenuButton.focus();
    });

    if (supportsMatchMedia) {
      const desktopNavigationQuery = window.matchMedia(DESKTOP_NAVIGATION_QUERY);
      const handleDesktopNavigationChange = (event) => {
        if (event.matches) {
          closeMobileMenu();
        }
      };

      if (desktopNavigationQuery.addEventListener) {
        desktopNavigationQuery.addEventListener(
          "change",
          handleDesktopNavigationChange,
        );
      } else {
        desktopNavigationQuery.addListener(handleDesktopNavigationChange);
      }
    }
  }

  copyButton?.addEventListener("click", copyCode);

  const activateTab = (tab, shouldFocus = false) => {
    const language = tab.getAttribute("data-language");
    const codeBlock = document.querySelector(
      `.code-container__code--${language}`,
    );
    const code = codeBlock?.querySelector("code");

    if (!codeBlock || !code) {
      console.error(`No code block found for language: ${language}`);
      return;
    }

    // Remove active class from all tabs and code blocks
    tabs.forEach((t) => {
      t.classList.remove("code-container__tab--active");
      t.setAttribute("aria-selected", "false");
      t.tabIndex = -1;
    });
    codeBlocks.forEach((c) => {
      c.classList.remove("code-container__code--active");
      c.hidden = true;
    });

    // Add active class to the clicked tab and corresponding code block
    tab.classList.add("code-container__tab--active");
    tab.setAttribute("aria-selected", "true");
    tab.tabIndex = 0;
    codeBlock.classList.add("code-container__code--active");
    codeBlock.hidden = false;

    if (shouldFocus) {
      tab.focus();
    }

    // Re-highlight the code block for Prism.js
    if (window.Prism?.highlightElement) {
      Prism.highlightElement(code);
    }
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      activateTab(this);
    });

    tab.addEventListener("keydown", function (event) {
      const currentIndex = tabList.indexOf(this);
      let nextIndex = currentIndex;

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        nextIndex = (currentIndex + 1) % tabList.length;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        nextIndex = (currentIndex - 1 + tabList.length) % tabList.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = tabList.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      activateTab(tabList[nextIndex], true);
    });
  });

  // Footer animation
  const footer = document.querySelector(".footer__inner");
  if (!footer || !("IntersectionObserver" in window)) {
    return;
  }

  const footerSpans = footer.querySelectorAll("span");
  const prefersReducedMotion =
    supportsMatchMedia &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches;

  if (prefersReducedMotion) {
    footerSpans.forEach((span) => {
      span.classList.add("animate");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          footerSpans.forEach((span, index) => {
            setTimeout(() => {
              span.classList.add("animate");
            }, index * 100); // Delay each letter by 100ms
          });
          observer.unobserve(footer); // Unobserve after animation triggers
        }
      });
    },
    {
      threshold: 0.1,
    },
  );

  observer.observe(footer);
});
