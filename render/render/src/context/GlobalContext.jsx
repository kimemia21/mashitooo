import React, { createContext, useContext, useState } from "react";
import { ModelType } from "../enums/AppEnums"; // import enums

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [selectedModel, setSelectedModel] = useState(ModelType.HOODIE); // default model

  return (
    <GlobalContext.Provider
      value={{
        selectedModel,
        setSelectedModel,
        ModelType // expose enums globally
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

// Custom hook for easy access
export const useGlobal = () => useContext(GlobalContext);
