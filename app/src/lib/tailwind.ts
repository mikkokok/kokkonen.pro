import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const buttonClasses = "px-3 py-1 rounded transition-colors";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export {buttonClasses }; 