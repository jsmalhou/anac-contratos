import { useState } from "react";

// Formata valor em Kz: 1000000.50 -> 1.000.000,50
export function formatKzInput(value: string): string {
  let clean = value.replace(/[^\d,]/g, "");
  const parts = clean.split(",");
  let intPart = parts[0] || "0";
  const decPart = parts[1] || "";
  intPart = intPart.replace(/^0+/, "") || "0";
  intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  if (decPart) {
    return `${intPart},${decPart.slice(0, 2)}`;
  }
  return intPart;
}

// Converte valor formatado para numero: 1.000.000,50 -> 1000000.50
export function parseKzValue(value: string): string {
  return value.replace(/\./g, "").replace(",", ".");
}

// Formata telefone: +244999999999 -> +244-999-999-999
export function formatPhone(value: string): string {
  let clean = value.replace(/[^\d+]/g, "");
  const hasPlus = clean.startsWith("+");
  clean = clean.replace(/\+/g, "");
  clean = clean.slice(0, 12);
  const parts: string[] = [];
  if (clean.length > 0) parts.push(clean.slice(0, 3));
  if (clean.length > 3) parts.push(clean.slice(3, 6));
  if (clean.length > 6) parts.push(clean.slice(6, 9));
  if (clean.length > 9) parts.push(clean.slice(9, 12));
  const formatted = parts.join("-");
  return hasPlus ? `+${formatted}` : formatted;
}

// Hook para input de valor em Kz
export function useKzInput(initialValue: string = ""): [string, (val: string) => void, () => string] {
  const [display, setDisplay] = useState(initialValue);
  const setValue = (val: string) => { setDisplay(formatKzInput(val)); };
  const getNumeric = () => parseKzValue(display);
  return [display, setValue, getNumeric];
}

// Hook para input de telefone
export function usePhoneInput(initialValue: string = ""): [string, (val: string) => void] {
  const [value, setValue] = useState(initialValue);
  const setPhone = (val: string) => { setValue(formatPhone(val)); };
  return [value, setPhone];
}
