import { animate, stagger } from 'motion';
import type { MotionControllerFactory } from '../core/controller';

const ease = [0.2, 0.75, 0.25, 1] as const;

export const createToolFilterController: MotionControllerFactory = (root, context) => {
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-tool-filter]'));
  const tiles = Array.from(root.querySelectorAll<HTMLElement>('[data-tool-groups]'));
  const announcement = root.querySelector<HTMLElement>('#tool-announcement');
  const count = root.querySelector<HTMLElement>('#tool-count');
  let generation = 0;
  let animations: Array<ReturnType<typeof animate>> = [];

  const cleanTile = (tile: HTMLElement) => {
    tile.style.removeProperty('transform');
    tile.style.removeProperty('opacity');
  };

  const stopAnimations = () => {
    animations.forEach((animation) => animation.stop());
    animations = [];
    tiles.forEach(cleanTile);
  };

  const setCount = (visible: number, filter: string, label: string) => {
    if (count) count.textContent = `${visible} / ${tiles.length}`;
    if (announcement) {
      announcement.textContent = `Showing ${visible} of ${tiles.length} public tools${filter === 'all' ? '.' : ` in ${label}.`}`;
    }
  };

  const applyFilter = (button: HTMLButtonElement) => {
    const batch = ++generation;
    stopAnimations();
    const filter = button.dataset.toolFilter ?? 'all';
    buttons.forEach((candidate) => candidate.setAttribute('aria-pressed', candidate === button ? 'true' : 'false'));

    const shouldShow = new Map(
      tiles.map((tile) => [
        tile,
        filter === 'all' || (tile.dataset.toolGroups ?? '').trim().split(/\s+/).includes(filter),
      ]),
    );
    const previousRects = new Map(
      tiles.filter((tile) => !tile.hidden).map((tile) => [tile, tile.getBoundingClientRect()]),
    );
    tiles.forEach((tile) => {
      tile.hidden = !shouldShow.get(tile);
      cleanTile(tile);
    });
    const visibleTiles = tiles.filter((tile) => !tile.hidden);
    setCount(visibleTiles.length, filter, button.textContent?.trim() ?? filter);

    if (context.reduced()) return;
    const nextRects = new Map(visibleTiles.map((tile) => [tile, tile.getBoundingClientRect()]));
    animations = visibleTiles.map((tile, index) => {
      const previous = previousRects.get(tile);
      const next = nextRects.get(tile)!;
      if (previous) {
        return animate(
          tile,
          { x: [previous.left - next.left, 0], y: [previous.top - next.top, 0], opacity: [0.72, 1] },
          { duration: 0.46, delay: Math.min(index * 0.018, 0.16), ease },
        );
      }
      return animate(
        tile,
        { opacity: [0, 1], scale: [0.96, 1], y: [12, 0] },
        { duration: 0.4, delay: stagger(0.025)(index, visibleTiles.length), ease },
      );
    });
    void Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
      if (batch === generation) visibleTiles.forEach(cleanTile);
    });
  };

  for (const button of buttons) {
    button.addEventListener('click', () => applyFilter(button), { signal: context.signal });
  }
  const initial = buttons.find((button) => button.getAttribute('aria-pressed') === 'true') ?? buttons[0];
  if (initial) setCount(tiles.length, initial.dataset.toolFilter ?? 'all', initial.textContent?.trim() ?? 'all');

  const stopPreference = context.onPreferenceChange((reduced) => {
    if (reduced) stopAnimations();
  });

  return () => {
    generation += 1;
    stopPreference();
    stopAnimations();
  };
};

export default createToolFilterController;
