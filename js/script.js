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

  mobileMenuButton.addEventListener("click", function () {
    const isOpen = nav.classList.toggle("active");
    mobileMenuButton.setAttribute("aria-expanded", String(isOpen));
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const language = this.getAttribute("data-language");

      // Remove active class from all tabs and code blocks
      tabs.forEach((t) => {
        t.classList.remove("code-container__tab--active");
        t.setAttribute("aria-pressed", "false");
      });
      codeBlocks.forEach((c) => {
        c.classList.remove("code-container__code--active");
        c.hidden = true;
      });

      // Add active class to the clicked tab and corresponding code block
      this.classList.add("code-container__tab--active");
      this.setAttribute("aria-pressed", "true");
      document
        .querySelector(`.code-container__code--${language}`)
        .classList.add("code-container__code--active");
      document.querySelector(`.code-container__code--${language}`).hidden =
        false;

      // Re-highlight the code block for Prism.js
      Prism.highlightElement(
        document.querySelector(`.code-container__code--${language} code`),
      );
    });
  });

  // Footer animation
  const footer = document.querySelector(".footer__inner");
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
