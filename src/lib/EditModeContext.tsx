import { createContext, useContext, useState, ReactNode } from "react";

interface EditModeContextType {
  isEditMode: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const EditModeContext = createContext<EditModeContextType>({
  isEditMode: false,
  login: () => false,
  logout: () => {},
});

const EDIT_PASSWORD = "9999";

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false);

  const login = (password: string) => {
    if (password === EDIT_PASSWORD) {
      setIsEditMode(true);
      return true;
    }
    return false;
  };

  const logout = () => setIsEditMode(false);

  return (
    <EditModeContext.Provider value={{ isEditMode, login, logout }}>
      {children}
    </EditModeContext.Provider>
  );
}

export const useEditMode = () => useContext(EditModeContext);
