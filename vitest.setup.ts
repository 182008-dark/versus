import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Sans `globals: true`, Testing Library ne nettoie pas le DOM entre deux tests.
afterEach(() => {
  cleanup();
});

// jsdom connaît <dialog> mais pas showModal()/close() : implémentation minimale pour les tests.
if (typeof HTMLDialogElement !== "undefined" && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.show = function show(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    if (!this.hasAttribute("open")) return;
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
}
