//CopyCode

function copyCode() {
  const activeCode = document.querySelector(
    ".code-container__code--active code",
  );

  if (!activeCode) {
    console.error("No active code block found to copy.");
    return;
  }

  const text = activeCode.textContent; // textContent gets all the text inside an element.

  if (!navigator.clipboard?.writeText) {
    console.error("Clipboard API is not available.");
    return;
  }

  navigator.clipboard
    .writeText(text)
    .then(() => {
      alert("Code copied!");
    })
    .catch((err) => {
      console.error("Failed to copy:", err);
    });
}

document.addEventListener("DOMContentLoaded", function () {
  const mobileMenuButton = document.querySelector(".mobile-menu-icon");
  const nav = document.querySelector(".header__nav");
  const tabs = document.querySelectorAll(".code-container__tab");
  const codeBlocks = document.querySelectorAll(".code-container__code");
  const tabList = Array.from(tabs);

  mobileMenuButton.addEventListener("click", function () {
    const isOpen = nav.classList.toggle("active");
    mobileMenuButton.setAttribute("aria-expanded", String(isOpen));
  });

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
