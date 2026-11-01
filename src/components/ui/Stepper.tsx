// AD Design Kit Stepper — Figma set "Stepper navigation" (node 1149:84064, page 110:14549), step 1149:84155.
// Figma Type → variant: Default=default · With dots=dots · Icons & text=icons · Only icons=only-icons · Cards=cards ·
// Vertical=vertical (Number & text steps). Step state comes from `current`; `status` overrides with error/disabled.
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { CheckIcon, CloseIcon } from '../icons';
import { IconShape } from './IconShape';

export type StepperVariant = 'default' | 'dots' | 'icons' | 'only-icons' | 'cards' | 'vertical';
export type StepStatus = 'initial' | 'active' | 'completed' | 'error' | 'disabled';

export interface Step {
  title: ReactNode;
  description?: ReactNode;
  /** Icon for icons / only-icons / cards variants. */
  icon?: ReactNode;
  /** Force error or disabled; otherwise derived from `current`. */
  status?: 'error' | 'disabled';
}

export interface StepperProps {
  steps: Step[];
  /** 0-based index of the active step; earlier steps are completed. */
  current: number;
  variant?: StepperVariant;
  className?: string;
}

const Check = () => <CheckIcon />;
// Figma Stepper "Error" uses the close icon.
const Alert = () => <CloseIcon />;

const textColor: Record<StepStatus, string> = {
  initial: 'text-body',
  active: 'text-fg-brand',
  completed: 'text-fg-brand',
  error: 'text-fg-danger',
  disabled: 'text-fg-disabled',
};

function statusOf(step: Step, i: number, current: number): StepStatus {
  if (step.status) return step.status;
  return i < current ? 'completed' : i === current ? 'active' : 'initial';
}

function Marker({ variant, status, index, icon }: { variant: StepperVariant; status: StepStatus; index: number; icon?: ReactNode }) {
  if (variant === 'dots') {
    return (
      <span
        className={cn(
          'size-3 shrink-0 rounded-full border',
          status === 'initial' && 'border-default-medium bg-neutral-primary',
          status === 'active' && 'border-brand-light bg-neutral-primary',
          status === 'completed' && 'border-brand bg-brand',
          status === 'error' && 'border-danger bg-danger',
          status === 'disabled' && 'border-default bg-neutral-primary',
        )}
      />
    );
  }
  if (variant === 'icons') {
    return <span className={cn('inline-flex shrink-0 [&_svg]:size-5', textColor[status])}>{status === 'completed' ? <Check /> : status === 'error' ? <Alert /> : icon ?? index + 1}</span>;
  }
  if (variant === 'only-icons') {
    const color = status === 'active' ? 'brand' : status === 'completed' ? 'success' : status === 'error' ? 'danger' : 'gray';
    return (
      <IconShape size="lg" shape="circle" color={color} className={cn(status === 'disabled' && 'text-fg-disabled')}>
        {status === 'completed' ? <Check /> : status === 'error' ? <Alert /> : icon ?? <span className="text-sm font-semibold">{index + 1}</span>}
      </IconShape>
    );
  }
  if (variant === 'vertical') {
    return (
      <span
        className={cn(
          'inline-flex size-9 shrink-0 items-center justify-center rounded-full text-base font-semibold [&_svg]:size-4',
          status === 'active' ? 'bg-brand-softer text-fg-brand-strong' : 'bg-neutral-tertiary',
          status === 'initial' && 'text-body',
          status === 'completed' && 'text-fg-brand',
          status === 'error' && 'text-fg-danger',
          status === 'disabled' && 'text-fg-disabled',
        )}
      >
        {status === 'completed' ? <Check /> : status === 'error' ? <Alert /> : index + 1}
      </span>
    );
  }
  // default: number circle
  return (
    <span
      className={cn(
        'inline-flex size-5 shrink-0 items-center justify-center rounded-full border text-xs font-semibold leading-3 [&_svg]:size-3.5',
        status === 'initial' && 'border-default-strong text-body',
        status === 'active' && 'border-brand text-fg-brand',
        status === 'completed' && 'border-brand text-fg-brand',
        status === 'error' && 'border-danger text-fg-danger',
        status === 'disabled' && 'border-default text-fg-disabled',
      )}
    >
      {status === 'completed' ? <Check /> : status === 'error' ? <Alert /> : index + 1}
    </span>
  );
}

const connector: Partial<Record<StepperVariant, string>> = {
  default: 'border-t',
  dots: 'border-t-2',
  icons: 'border-t-4',
  'only-icons': 'border-t-4',
};

export function Stepper({ steps, current, variant = 'default', className }: StepperProps) {
  if (variant === 'cards') {
    return (
      <ol className={cn('flex flex-col gap-4 md:flex-row', className)}>
        {steps.map((step, i) => {
          const status = statusOf(step, i, current);
          return (
            <li
              key={i}
              aria-current={status === 'active' ? 'step' : undefined}
              aria-disabled={status === 'disabled' || undefined}
              className={cn(
                'flex flex-1 items-center gap-2 rounded-base border p-4 text-base font-medium [&_svg]:size-5',
                status === 'initial' && 'border-default-medium bg-neutral-secondary-medium text-body',
                (status === 'active' || status === 'completed') && 'border-brand-subtle bg-brand-softer text-fg-brand-strong',
                status === 'error' && 'border-danger-subtle bg-danger-soft text-fg-danger-strong',
                status === 'disabled' && 'border-default bg-neutral-secondary-soft text-fg-disabled',
              )}
            >
              {status === 'completed' ? <Check /> : status === 'error' ? <Alert /> : step.icon}
              <span>{step.title}</span>
            </li>
          );
        })}
      </ol>
    );
  }

  if (variant === 'vertical') {
    return (
      <ol className={cn('flex flex-col', className)}>
        {steps.map((step, i) => {
          const status = statusOf(step, i, current);
          return (
            <li key={i} aria-current={status === 'active' ? 'step' : undefined}
              aria-disabled={status === 'disabled' || undefined} className="flex gap-4">
              <div className="flex flex-col items-center">
                <Marker variant="vertical" status={status} index={i} />
                {i < steps.length - 1 && <span className="w-px flex-1 border-s border-default" aria-hidden />}
              </div>
              <div className={cn('flex flex-col gap-1 pt-1.5', i < steps.length - 1 && 'pb-8')}>
                <span className={cn('text-base font-medium leading-6', status === 'active' ? 'text-fg-brand' : status === 'initial' ? 'text-heading' : textColor[status])}>
                  {step.title}
                </span>
                {step.description && <span className={cn('text-sm', status === 'disabled' ? 'text-fg-disabled' : 'text-body')}>{step.description}</span>}
              </div>
            </li>
          );
        })}
      </ol>
    );
  }

  const showLabel = variant !== 'only-icons';
  return (
    <ol className={cn('flex w-full items-center gap-4', variant === 'dots' && 'gap-5', className)}>
      {steps.map((step, i) => {
        const status = statusOf(step, i, current);
        return (
          <li key={i} aria-current={status === 'active' ? 'step' : undefined}
              aria-disabled={status === 'disabled' || undefined} className={cn('flex items-center gap-4', i < steps.length - 1 && 'flex-1')}>
            <span className={cn('flex shrink-0 items-center', variant === 'dots' ? 'gap-3' : 'gap-2')}>
              <Marker variant={variant} status={status} index={i} icon={step.icon} />
              {showLabel ? (
                <span className={cn('text-base font-medium leading-4', textColor[status])}>{step.title}</span>
              ) : (
                <span className="sr-only">{step.title}</span>
              )}
            </span>
            {i < steps.length - 1 && <span className={cn('flex-1 border-default', connector[variant])} aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}
