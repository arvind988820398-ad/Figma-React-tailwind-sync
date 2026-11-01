import { useMemo, useReducer, useState, type ReactNode } from 'react';
import { CheckCircleIcon } from '../../components/icons';
import { Toast, ToastViewport } from '../../components/ui/Toast';
import { initialState, reducer, StoreContext, type Store } from './model';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const value = useMemo<Store>(
    () => ({
      state,
      dispatch,
      material: (id) => state.materials.find((m) => m.id === id)!,
      project: (id) => state.projects.find((p) => p.id === id) ?? { id, name: 'Unknown project' },
      notify: (message) => setToast({ id: Date.now(), message }),
    }),
    [state],
  );
  return (
    <StoreContext.Provider value={value}>
      {children}
      {toast && (
        <ToastViewport>
          <Toast key={toast.id} icon={<CheckCircleIcon />} onDismiss={() => setToast(null)} duration={4000}>
            {toast.message}
          </Toast>
        </ToastViewport>
      )}
    </StoreContext.Provider>
  );
}
