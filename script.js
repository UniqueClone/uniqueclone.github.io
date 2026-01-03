/**
 * Custom animated details/summary implementation
 * to replace default browser behavior with smooth height transitions.
 * Applies to all <details> elements on the page.
 */
document.addEventListener("DOMContentLoaded", () => {
    const detailsElements = document.querySelectorAll("details");

    detailsElements.forEach((details) => {
        const summary = details.querySelector("summary");
        if (!summary) return;

        // Wrap all non-summary children in a content container
        const contentWrapper = document.createElement("div");
        contentWrapper.classList.add("details-content");

        const children = Array.from(details.children);
        children.forEach((child) => {
            if (child !== summary) {
                contentWrapper.appendChild(child);
            }
        });

        details.appendChild(contentWrapper);

        // If details is initially open, set the height to auto
        if (details.hasAttribute("open")) {
            contentWrapper.style.height = "auto";
        }

        summary.addEventListener("click", (event) => {
            event.preventDefault();

            const isOpen = details.hasAttribute("open");
            const isAnimating = details.dataset.animating === "true";
            if (isAnimating) return;

            details.dataset.animating = "true";

            if (!isOpen) {
                // Opening: set height from 0 to scrollHeight
                details.setAttribute("open", "");
                contentWrapper.style.height = "0px";

                requestAnimationFrame(() => {
                    const targetHeight = contentWrapper.scrollHeight;
                    contentWrapper.style.height = `${targetHeight}px`;
                });

                const onOpenEnd = (e) => {
                    if (e.propertyName !== "height") return;
                    contentWrapper.removeEventListener(
                        "transitionend",
                        onOpenEnd
                    );
                    contentWrapper.style.height = "auto";
                    details.dataset.animating = "false";
                };

                contentWrapper.addEventListener("transitionend", onOpenEnd);
            } else {
                // Closing: animate from current height to 0, then remove open
                const startHeight = contentWrapper.scrollHeight;
                contentWrapper.style.height = `${startHeight}px`;

                requestAnimationFrame(() => {
                    contentWrapper.style.height = "0px";
                });

                const onCloseEnd = (e) => {
                    if (e.propertyName !== "height") return;
                    contentWrapper.removeEventListener(
                        "transitionend",
                        onCloseEnd
                    );
                    details.removeAttribute("open");
                    details.dataset.animating = "false";
                };

                contentWrapper.addEventListener("transitionend", onCloseEnd);
            }
        });
    });
});
