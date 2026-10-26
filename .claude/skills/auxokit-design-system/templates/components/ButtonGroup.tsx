// AuxoKit Button group — Figma set "Group button" (node 1149:31694, page 1149:31693), examples 1149:31799.
// Figma Color: Gray = Secondary buttons, White = Tertiary buttons. Items overlap by 1px; the group carries shadow-xs.
// If the group switches content panels, use <Tabs variant="segmented"> instead (tab semantics).
import { createContext, forwardRef, useContext, type ButtonHTMLAttributes, type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { buttonVariants } from './Button';

export type ButtonGroupColor = 'gray' | 'white';
export type ButtonGroupSize = 'xs' | 'sm' | 'base' | 'lg';

const Ctx = createContext<{ color: ButtonGroupColor; size: ButtonGroupSize; vertical: boolean }>({ color: 'white', size: 'base', vertical: false });

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  color?: ButtonGroupColor;
  size?: ButtonGroupSize;
  vertical?: boolean;
  /** Accessible name for the group. */
  label?: string;
}

export function ButtonGroup({ color = 'white', size = 'base', vertical = false, label, className, ...props }: ButtonGroupProps) {
  return (
    <Ctx.Provider value={{ color, size, vertical }}>
      <div
        role="group"
        aria-label={label}
        className={cn('inline-flex rounded-base shadow-xs', vertical ? 'flex-col -space-y-px' : '-space-x-px', className)}
        {...props}
      />
    </Ctx.Provider>
  );
}

export interface ButtonGroupItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Selected item: Tertiary Hover style. Sets aria-pressed. */
  active?: boolean;
  iconOnly?: boolean;
}

export const ButtonGroupItem = forwardRef<HTMLButtonElement, ButtonGroupItemProps>(function ButtonGroupItem(
  { active, iconOnly, className, type = 'button', ...props },
  ref,
) {
  const { color, size, vertical } = useContext(Ctx);
  return (
    <button // auxokit-lint-ignore: styled with buttonVariants; adds joined corners + aria-pressed
      ref={ref}
      type={type}
      aria-pressed={active}
      className={cn(
        buttonVariants({ color: color === 'gray' ? 'secondary' : 'tertiary', size, iconOnly }),
        'relative rounded-none shadow-none focus-visible:z-10',
        vertical ? 'w-full first:rounded-t-base last:rounded-b-base' : 'first:rounded-s-base last:rounded-e-base',
        iconOnly && 'text-body',
        active && 'bg-neutral-secondary-medium text-heading',
        className,
      )}
      {...props}
    />
  );
});
