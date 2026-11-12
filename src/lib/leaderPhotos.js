/**
 * The Director's portrait is optional. Drop a file named `susandhya.webp`
 * (or .jpg / .jpeg / .png) into src/assets/img/ and every page that shows her
 * switches from the placeholder to the photo — no code change needed.
 */
const found = import.meta.glob("../assets/img/susandhya.*", { eager: true, query: "?url", import: "default" });

export const directorPhoto = Object.values(found)[0] ?? null;
