/** Small DOM helpers shared by the screens. */

/** The visible "open" button of the row/card with this id (used to put focus back after a drawer closes). */
export const rowOpenButton = (id) => {
  const escaped = window.CSS?.escape ? window.CSS.escape(String(id)) : String(id).replace(/"/g, '\\"');
  const found = [...document.querySelectorAll(`[data-row-id="${escaped}"] [data-row-open]`)].find((element) => element.getClientRects().length > 0);
  return found ?? null;
};

/** Move focus to the page's h1 (after a route change) without scrolling. */
export const focusPageTitle = () => {
  const title = document.querySelector("[data-page-title]");
  if (title) title.focus({ preventScroll: true });
};
