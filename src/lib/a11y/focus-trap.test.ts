import { afterEach, describe, expect, it } from "vitest";
import { getFocusableElements, trapTabKey, wrapFocusIndex } from "./focus-trap";

describe("wrapFocusIndex", () => {
  it("boucle du dernier élément au premier avec Tab", () => {
    expect(wrapFocusIndex(2, 3, false)).toBe(0);
  });

  it("boucle du premier élément au dernier avec Maj+Tab", () => {
    expect(wrapFocusIndex(0, 3, true)).toBe(2);
  });

  it("laisse le navigateur faire au milieu de la liste", () => {
    expect(wrapFocusIndex(1, 3, false)).toBeNull();
    expect(wrapFocusIndex(1, 3, true)).toBeNull();
  });

  it("ramène dans la liste un focus qui en est sorti", () => {
    expect(wrapFocusIndex(-1, 3, false)).toBe(0);
    expect(wrapFocusIndex(-1, 3, true)).toBe(2);
  });

  it("ne fait rien sans élément focalisable", () => {
    expect(wrapFocusIndex(-1, 0, false)).toBeNull();
  });
});

describe("getFocusableElements et trapTabKey", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  function setup() {
    document.body.innerHTML = `
      <div id="boite">
        <a href="/a">Premier</a>
        <button disabled>Désactivé</button>
        <span tabindex="-1">Programmatique</span>
        <div hidden><button>Caché</button></div>
        <button>Dernier</button>
      </div>`;
    return document.getElementById("boite")!;
  }

  it("ignore les éléments désactivés, cachés ou hors tabulation", () => {
    const names = getFocusableElements(setup()).map((el) => el.textContent);
    expect(names).toEqual(["Premier", "Dernier"]);
  });

  it("Tab sur le dernier élément revient au premier", () => {
    const box = setup();
    const [first, last] = getFocusableElements(box);
    last!.focus();
    const event = new KeyboardEvent("keydown", { key: "Tab", cancelable: true });
    trapTabKey(event, box);
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(first);
  });

  it("Maj+Tab sur le premier élément va au dernier", () => {
    const box = setup();
    const [first, last] = getFocusableElements(box);
    first!.focus();
    const event = new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, cancelable: true });
    trapTabKey(event, box);
    expect(document.activeElement).toBe(last);
  });

  it("ignore les autres touches", () => {
    const box = setup();
    const event = new KeyboardEvent("keydown", { key: "Enter", cancelable: true });
    trapTabKey(event, box);
    expect(event.defaultPrevented).toBe(false);
  });
});
