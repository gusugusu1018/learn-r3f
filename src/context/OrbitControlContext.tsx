import type React from "react";
import { createContext, useState, useCallback } from "react";

interface OrbitControlContextProps {
  enableOrbitControl: boolean;
  handleDragStart: () => void;
  handleDragEnd: () => void;
}

export const OrbitControlContext = createContext<
  OrbitControlContextProps | undefined
>(undefined);

export const OrbitControlProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [enableOrbitControl, setEnableOrbitControl] = useState(true);

  const handleDragStart = useCallback(() => {
    setEnableOrbitControl(false);
  }, []);

  const handleDragEnd = useCallback(() => {
    setEnableOrbitControl(true);
  }, []);

  const value = {
    enableOrbitControl,
    handleDragStart,
    handleDragEnd,
  };

  return (
    <OrbitControlContext.Provider value={value}>
      {children}
    </OrbitControlContext.Provider>
  );
};
