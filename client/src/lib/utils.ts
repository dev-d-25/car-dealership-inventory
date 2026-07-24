import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { AxiosError } from "axios"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data
    const error = data?.error
    const errorMsg =
      typeof error === "object" && error !== null
        ? error.message
        : typeof error === "string"
          ? error
          : undefined
    return data?.message || errorMsg || err.message || "Something went wrong"
  }
  if (err instanceof Error) {
    return err.message
  }
  return "Something went wrong"
}
