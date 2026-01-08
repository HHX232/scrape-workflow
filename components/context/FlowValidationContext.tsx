import { AppNodeMissingInputs } from "@/types/appNode";
import { createContext, Dispatch, SetStateAction, useState } from "react";

export type FlowValidationContextType = {
  invalidInputs: AppNodeMissingInputs[];
  setInvalidInputs: Dispatch<SetStateAction<AppNodeMissingInputs[]>>;
  clearErrors: () => void;
  
};

export const FlowValidationContext = createContext<FlowValidationContextType | null>(null);

export function FlowValidationContentProvider({
   children
}: {
   children: React.ReactNode;
}) {
   const [invalidInputs, setInvalidInputs] = useState<AppNodeMissingInputs[]>([]);

   return (
      <FlowValidationContext.Provider value={{ invalidInputs, setInvalidInputs, clearErrors: () => setInvalidInputs([]) }}>
         {children}
      </FlowValidationContext.Provider>
   );
}