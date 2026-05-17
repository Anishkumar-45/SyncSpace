export type TextPatch = {
  start: number;
  deleteCount: number;
  insertText: string;
};

export function createTextPatch(previous: string, next: string): TextPatch | null {
  if (previous === next) {
    return null;
  }

  let start = 0;
  while (start < previous.length && start < next.length && previous[start] === next[start]) {
    start += 1;
  }

  let previousEnd = previous.length - 1;
  let nextEnd = next.length - 1;
  while (previousEnd >= start && nextEnd >= start && previous[previousEnd] === next[nextEnd]) {
    previousEnd -= 1;
    nextEnd -= 1;
  }

  return {
    start,
    deleteCount: previousEnd >= start ? previousEnd - start + 1 : 0,
    insertText: nextEnd >= start ? next.slice(start, nextEnd + 1) : ""
  };
}
