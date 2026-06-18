import { useState } from "react";

// Capitaliza a primeira letra de uma string
export function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Wrapper para onChange que capitaliza automaticamente
export function capitalizeOnChange(
  handler: (value: string) => void
): (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void {
  return (e) => {
    const value = e.target.value;
    // Capitaliza primeiro caracter e apos pontuacao
    const capitalized = value.replace(
      /(?:^|[.!?]\s+)([a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ])/g,
      (match) => match.toUpperCase()
    );
    handler(capitalized);
  };
}

// Hook para inputs com capitalizacao automatica
export function useCapitalizeInput(initialValue: string = ""): [string, (val: string) => void] {
  const [value, setValue] = useState(initialValue);

  const setCapitalized = (val: string) => {
    if (val.length === 1) {
      setValue(val.toUpperCase());
    } else {
      setValue(val);
    }
  };

  return [value, setCapitalized];
}
