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

    // Projects horizontal tab navigation
    const projectTabs = document.querySelectorAll(
        ".menu-pill[data-project-id]"
    );
    const projectPanels = document.querySelectorAll(".project-panel");

    if (projectTabs.length && projectPanels.length) {
        const projectTabsArray = Array.from(projectTabs);
        let activeProjectId = null;

        const setActiveProject = (id) => {
            if (activeProjectId === id) {
                return;
            }

            const currentPanel = Array.from(projectPanels).find(
                (panel) => !panel.hidden
            );
            const nextPanel = Array.from(projectPanels).find(
                (panel) => panel.dataset.projectId === id
            );

            projectTabsArray.forEach((tab) => {
                const isActive = tab.dataset.projectId === id;
                tab.classList.toggle("is-active", isActive);
                tab.setAttribute("aria-selected", isActive ? "true" : "false");
                tab.tabIndex = isActive ? 0 : -1;
            });

            const showNext = () => {
                if (!nextPanel) return;
                nextPanel.hidden = false;
                // Force reflow so transition runs from initial state
                void nextPanel.offsetWidth;
                nextPanel.classList.add("is-active");
            };

            if (currentPanel && currentPanel !== nextPanel) {
                currentPanel.classList.remove("is-active");

                const handleEnd = (event) => {
                    if (event.propertyName !== "opacity") return;
                    currentPanel.removeEventListener(
                        "transitionend",
                        handleEnd
                    );
                    currentPanel.hidden = true;
                    showNext();
                };

                currentPanel.addEventListener("transitionend", handleEnd);
            } else {
                showNext();
            }

            activeProjectId = id;
        };

        const focusProjectTabByIndex = (index) => {
            const target = projectTabsArray[index];
            if (!target) return;
            const id = target.dataset.projectId;
            if (!id) return;
            setActiveProject(id);
            target.focus();
        };

        projectTabsArray.forEach((tab, index) => {
            tab.addEventListener("click", () => {
                const id = tab.dataset.projectId;
                if (id) {
                    setActiveProject(id);
                }
            });

            tab.addEventListener("keydown", (event) => {
                const key = event.key;
                let nextIndex = -1;

                if (key === "ArrowRight" || key === "ArrowDown") {
                    nextIndex = (index + 1) % projectTabsArray.length;
                } else if (key === "ArrowLeft" || key === "ArrowUp") {
                    nextIndex =
                        (index - 1 + projectTabsArray.length) %
                        projectTabsArray.length;
                } else if (key === "Home") {
                    nextIndex = 0;
                } else if (key === "End") {
                    nextIndex = projectTabsArray.length - 1;
                } else if (key === "Enter" || key === " ") {
                    const id = tab.dataset.projectId;
                    if (id) {
                        setActiveProject(id);
                        event.preventDefault();
                    }
                }

                if (nextIndex !== -1) {
                    focusProjectTabByIndex(nextIndex);
                    event.preventDefault();
                }
            });
        });

        const initialProjectTab =
            document.querySelector(".menu-pill.is-active[data-project-id]") ||
            projectTabsArray[0];
        if (initialProjectTab && initialProjectTab.dataset.projectId) {
            setActiveProject(initialProjectTab.dataset.projectId);
        }
    }

    // Core skills pill navigation
    const skillPills = document.querySelectorAll(".menu-pill[data-skill-id]");
    const skillPanels = document.querySelectorAll(
        ".skills-panel[data-skill-id]"
    );

    if (skillPills.length && skillPanels.length) {
        const skillPillsArray = Array.from(skillPills);
        let activeSkillId = null;

        const setActiveSkill = (id) => {
            if (activeSkillId === id) {
                return;
            }

            const currentPanel = Array.from(skillPanels).find(
                (panel) => !panel.hidden
            );
            const nextPanel = Array.from(skillPanels).find(
                (panel) => panel.dataset.skillId === id
            );

            skillPillsArray.forEach((pill) => {
                const isActive = pill.dataset.skillId === id;
                pill.classList.toggle("is-active", isActive);
                pill.setAttribute("aria-selected", isActive ? "true" : "false");
                pill.tabIndex = isActive ? 0 : -1;
            });

            const showNext = () => {
                if (!nextPanel) return;
                nextPanel.hidden = false;
                void nextPanel.offsetWidth;
                nextPanel.classList.add("is-active");
            };

            if (currentPanel && currentPanel !== nextPanel) {
                currentPanel.classList.remove("is-active");

                const handleEnd = (event) => {
                    if (event.propertyName !== "opacity") return;
                    currentPanel.removeEventListener(
                        "transitionend",
                        handleEnd
                    );
                    currentPanel.hidden = true;
                    showNext();
                };

                currentPanel.addEventListener("transitionend", handleEnd);
            } else {
                showNext();
            }

            activeSkillId = id;
        };

        const focusSkillPillByIndex = (index) => {
            const target = skillPillsArray[index];
            if (!target) return;
            const id = target.dataset.skillId;
            if (!id) return;
            setActiveSkill(id);
            target.focus();
        };

        skillPillsArray.forEach((pill, index) => {
            pill.addEventListener("click", () => {
                const id = pill.dataset.skillId;
                if (id) {
                    setActiveSkill(id);
                }
            });

            pill.addEventListener("keydown", (event) => {
                const key = event.key;
                let nextIndex = -1;

                if (key === "ArrowRight" || key === "ArrowDown") {
                    nextIndex = (index + 1) % skillPillsArray.length;
                } else if (key === "ArrowLeft" || key === "ArrowUp") {
                    nextIndex =
                        (index - 1 + skillPillsArray.length) %
                        skillPillsArray.length;
                } else if (key === "Home") {
                    nextIndex = 0;
                } else if (key === "End") {
                    nextIndex = skillPillsArray.length - 1;
                } else if (key === "Enter" || key === " ") {
                    const id = pill.dataset.skillId;
                    if (id) {
                        setActiveSkill(id);
                        event.preventDefault();
                    }
                }

                if (nextIndex !== -1) {
                    focusSkillPillByIndex(nextIndex);
                    event.preventDefault();
                }
            });
        });

        const initialSkillPill =
            document.querySelector(
                ".skills-category-pill.is-active[data-skill-id]"
            ) || skillPillsArray[0];
        if (initialSkillPill && initialSkillPill.dataset.skillId) {
            setActiveSkill(initialSkillPill.dataset.skillId);
        }
    }
});
