import { AlertDto } from '@radio-alert/models';
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AlertContextType {
  selectedAlert: AlertDto | null;
  setSelectedAlert: (alert: AlertDto | null) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [selectedAlert, setSelectedAlert] = useState<AlertDto | null>(null);

  return (
    <AlertContext.Provider value={React.useMemo(() => ({ selectedAlert, setSelectedAlert }), [selectedAlert, setSelectedAlert])}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
