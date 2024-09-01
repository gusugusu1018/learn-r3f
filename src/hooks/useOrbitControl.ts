import { useContext } from "react";
import { OrbitControlContext } from "../context/OrbitControlContext";

const useOrbitControl = () => {
  const context = useContext(OrbitControlContext);
  if (!context) {
    throw new Error(
      "useOrbitControl must be used within an OrbitControlProvider"
    );
  }
  return context;
};

export default useOrbitControl;
