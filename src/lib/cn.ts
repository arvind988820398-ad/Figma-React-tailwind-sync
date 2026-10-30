import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// tailwind-merge must know AD Design Kit's custom classes, or it cannot tell that
// `bg-brand` and `bg-brand-strong` conflict, or that `text-heading` is a color
// while `text-sm` is a size.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      radius: ['xxs', 'xs', 'sm', 'base', 'lg', 'xl'],
      shadow: ['xs', 'bottom-dropdown', 'top', 'focus-brand', 'focus-secondary', 'focus-success', 'focus-danger', 'focus-warning', 'focus-dark'],
      text: ['xxs'],
    },
    classGroups: {
      'bg-color': [{ bg: [isADDesignKitBg] }],
      'text-color': [{ text: [isADDesignKitText] }],
      'border-color': [{ border: [isADDesignKitBorder] }],
    },
  },
});

const BG = /^(neutral-|brand|success|danger|warning|dark|disabled|gray$|quaternary-|overlay-|variants-|purple$|sky$|teal$|pink$|cyan$|fuchsia$|indigo$|orange$|white$)/;
const TEXT = /^(heading|body|body-subtle|fg-.+|white|black)$/;
const BORDER = /^(default|light|muted|buffer|brand|success|danger|warning|dark|purple|orange)(-.+)?$/;
function isADDesignKitBg(v: string) { return BG.test(v); }
function isADDesignKitText(v: string) { return TEXT.test(v); }
function isADDesignKitBorder(v: string) { return BORDER.test(v); }

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
