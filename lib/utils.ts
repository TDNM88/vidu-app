import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

export function isValidImageFile(file: File) {
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
  return validTypes.includes(file.type)
}

export function isFileSizeValid(file: File, maxSizeMB = 5) {
  return file.size <= maxSizeMB * 1024 * 1024
}

