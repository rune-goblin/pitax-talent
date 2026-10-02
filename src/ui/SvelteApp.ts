import { mount, unmount, type Component } from 'svelte';

const { ApplicationV2 } = foundry.applications.api;

/** ApplicationV2 shell that mounts one Svelte component once and unmounts it on close. */
export abstract class SvelteApp extends ApplicationV2 {
  protected abstract component: Component;

  #instance?: ReturnType<typeof mount>;
  #root?: HTMLElement;

  protected override async _renderHTML(): Promise<HTMLElement> {
    if (!this.#instance) {
      this.#root = document.createElement('div');
      this.#root.classList.add('pitax-talent-root');
      this.#instance = mount(this.component, { target: this.#root });
    }
    return this.#root!;
  }

  protected override _replaceHTML(result: HTMLElement, content: HTMLElement): void {
    content.replaceChildren(result);
  }

  protected override async _preClose(): Promise<void> {
    if (this.#instance) {
      void unmount(this.#instance);
      this.#instance = undefined;
      this.#root = undefined;
    }
  }
}
