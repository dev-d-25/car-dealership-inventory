import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { AxiosError } from "axios"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    return (
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      "Something went wrong"
    )
  }
  if (err instanceof Error) {
    return err.message
  }
  return "Something went wrong"
}
