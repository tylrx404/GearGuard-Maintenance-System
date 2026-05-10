import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts and formats the first name from an email address.
 * Example: pruthvi.kokate@gmail.com → Pruthvi
 * Example: john@gearguard.com → John
 */
export function extractFirstNameFromEmail(email: string): string {
  if (!email) return "User"

  // Get the part before '@'
  const localPart = email.split("@")[0]

  // If it contains '.', take only the first segment
  const firstName = localPart.includes(".") ? localPart.split(".")[0] : localPart

  // Capitalize the first letter
  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()
}
