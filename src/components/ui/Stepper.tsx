// AD Design Kit Stepper — Figma set "Stepper navigation" (node 1149:84064, page 110:14549), step 1149:84155.
// Figma Type → variant: Default=default · With dots=dots · Icons & text=icons · Only icons=only-icons · Cards=cards ·
// Vertical=vertical. Icons & text and Vertical use the "Icon shape & text" step (IconShape base + title + helper text).
// Step state comes from `current`; `status` overrides with error/disabled.
// Breakpoint=Mobile: Default turns its connectors into short vertical dividers (and wraps); Icons & text stacks
// vertically; With dots and Default use 14px labels.
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { ArrowRightIcon, CheckIcon, CloseIcon } from '../icons';
import { IconShape } from './IconShape';

export type StepperVariant = 'default' | 'dots' | 'icons' | 'only-icons' | 'cards' | 'vertical';
export type StepStatus = 'initial' | 'active' | 'completed' | 'error' | 'disabled';

export interface Step {
  title: ReactNode;
  /** Helper text under the title (icons and vertical variants). */
  description?: ReactNode;
  /** Icon for the icons, only-icons and vertical variants. */
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

/** Screen-reader state after the title, so "completed" is not only a check icon. */
const srState = (status: StepStatus) =>
  status === 'completed' || status === 'error' ? <span className="sr-only"> ({status === 'completed' ? 'completed' : 'error'})</span> : null;

function Shape({ status, icon, index, size }: { status: StepStatus; icon?: ReactNode; index: number; size: 'base' | 'lg' }) {
  // Figma: completed and active steps use the brand shape, upcoming ones gray.
  const color = status === 'active' || status === 'completed' ? 'brand' : status === 'error' ? 'danger' : 'gray';
  return (
    <IconShape size={size} shape="circle" color={color} className={cn(status === 'disabled' && 'text-fg-disabled')}>
      {status === 'completed' ? <Check /> : status === 'error' ? <Alert /> : icon ?? <span className="text-sm font-semibold">{index + 1}</span>}
    </IconShape>
  );
}

function NumberCircle({ status, index }: { status: StepStatus; index: number }) {
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

function Dot({ status }: { status: StepStatus }) {
  return (
    <span
      className={cn(
        'relative size-4 shrink-0 rounded-full border',
        status === 'initial' && 'border-default-medium bg-neutral-primary',
        status === 'active' && 'border-brand-light bg-neutral-primary',
        status === 'completed' && 'border-brand bg-brand',
        status === 'error' && 'border-danger bg-danger',
        status === 'disabled' && 'border-default bg-neutral-primary',
      )}
    />
  );
}

/** Figma "Icon shape & text" step: IconShape base, title and helper text in the step colour. */
function ShapeAndText({ step, status, index }: { step: Step; status: StepStatus; index: number }) {
  return (
    <span className="flex shrink-0 items-center gap-3">
      <Shape status={status} icon={step.icon} index={index} size="base" />
      <span className={cn('flex flex-col gap-0.5', textColor[status])}>
        <span className="text-base font-medium leading-5">
          {step.title}
          {srState(status)}
        </span>
        {step.description && <span className="text-sm leading-4">{step.description}</span>}
      </span>
    </span>
  );
}

export function Stepper({ steps, current, variant = 'default', className }: StepperProps) {
  const itemProps = (status: StepStatus) => ({
    'aria-current': status === 'active' ? ('step' as const) : undefined,
    'aria-disabled': status === 'disabled' || undefined,
  });

  if (variant === 'cards') {
    return (
      <ol className={cn('flex w-full max-w-md flex-col gap-4', className)}>
        {steps.map((step, i) => {
          const status = statusOf(step, i, current);
          return (
            <li
              key={i}
              {...itemProps(status)}
              className={cn(
                'flex items-center gap-2 rounded-base border p-4 text-base font-medium [&_svg]:size-5',
                status === 'initial' && 'border-default-medium bg-neutral-secondary-medium text-body',
                (status === 'active' || status === 'completed') && 'border-brand-subtle bg-brand-softer text-fg-brand-strong',
                status === 'error' && 'border-danger-subtle bg-danger-soft text-fg-danger-strong',
                status === 'disabled' && 'border-default bg-neutral-secondary-soft text-fg-disabled',
              )}
            >
              <span>{i + 1}</span>
              <span className="flex-1">
                {step.title}
                {srState(status)}
              </span>
              {status === 'completed' ? <Check /> : status === 'active' ? <ArrowRightIcon /> : status === 'error' ? <Alert /> : null}
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
            <li key={i} {...itemProps(status)} className="flex flex-col">
              <ShapeAndText step={step} status={status} index={i} />
              {i < steps.length - 1 && (
                <span className="flex w-9 justify-center" aria-hidden>
                  <span className="h-14 border-s border-default" />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    );
  }

  if (variant === 'dots') {
    return (
      <ol className={cn('relative flex w-full items-end justify-between gap-2 sm:gap-5', className)}>
        <span className="absolute inset-x-0 bottom-1.5 border-t-2 border-default" aria-hidden />
        {steps.map((step, i) => {
          const status = statusOf(step, i, current);
          return (
            <li key={i} {...itemProps(status)} className="flex flex-col items-center gap-3">
              <span className={cn('text-center text-sm font-medium leading-4 sm:text-base', textColor[status])}>
                {step.title}
                {srState(status)}
              </span>
              <Dot status={status} />
            </li>
          );
        })}
      </ol>
    );
  }

  if (variant === 'icons') {
    return (
      <ol className={cn('flex w-full flex-col gap-5 md:flex-row md:items-center', className)}>
        {steps.map((step, i) => {
          const status = statusOf(step, i, current);
          return (
            <li key={i} {...itemProps(status)} className={cn('flex flex-col gap-5 md:flex-row md:items-center', i < steps.length - 1 && 'md:flex-1')}>
              <ShapeAndText step={step} status={status} index={i} />
              {i < steps.length - 1 && (
                <span className="ms-4 h-6 border-s-4 border-default md:ms-0 md:h-auto md:flex-1 md:border-s-0 md:border-t-4" aria-hidden />
              )}
            </li>
          );
        })}
      </ol>
    );
  }

  if (variant === 'only-icons') {
    return (
      <ol className={cn('flex w-full items-center gap-3 sm:gap-5', className)}>
        {steps.map((step, i) => {
          const status = statusOf(step, i, current);
          return (
            <li key={i} {...itemProps(status)} className={cn('flex items-center gap-3 sm:gap-5', i < steps.length - 1 && 'flex-1')}>
              <Shape status={status} icon={step.icon} index={i} size="lg" />
              <span className="sr-only">
                {step.title}
                {srState(status)}
              </span>
              {i < steps.length - 1 && <span className="min-w-2 flex-1 border-t-4 border-default" aria-hidden />}
            </li>
          );
        })}
      </ol>
    );
  }

  // default: number circle + label; Mobile uses short vertical dividers and wraps.
  return (
    <ol className={cn('flex w-full flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-4', className)}>
      {steps.map((step, i) => {
        const status = statusOf(step, i, current);
        return (
          <li key={i} {...itemProps(status)} className={cn('flex shrink-0 items-center gap-2 sm:shrink sm:gap-4', i < steps.length - 1 && 'sm:flex-1')}>
            <span className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <NumberCircle status={status} index={i} />
              <span className={cn('text-sm font-medium leading-4 sm:text-base', textColor[status])}>
                {step.title}
                {srState(status)}
              </span>
            </span>
            {i < steps.length - 1 && <span className="h-4 border-s border-default sm:h-auto sm:flex-1 sm:border-s-0 sm:border-t" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}
