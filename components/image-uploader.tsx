"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, Camera } from "lucide-react"
import Image from "next/image"

type UploadedImage = {
  file: File
  preview: string
}

interface ImageUploaderProps {
  label: string
  onChange: (image: UploadedImage | null) => void
  value: UploadedImage | null
  required?: boolean
  disabled?: boolean
}

export function ImageUploader({ label, onChange, value, required = false, disabled = false }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn tệp hình ảnh")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      onChange({
        file,
        preview: reader.result as string,
      })
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled) return

    const file = e.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const removeImage = () => {
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-3">
      <Label className="block font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      {value ? (
        <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shadow-md group">
          <Image
            src={value.preview || "/placeholder.svg"}
            alt={label}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-90 shadow-md transition-opacity duration-200"
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs p-3 pt-6">
            <div className="truncate font-medium">{value.file.name}</div>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg aspect-square flex flex-col items-center justify-center p-6 transition-all duration-300 cursor-pointer ${
            isDragging ? "border-blue-400 bg-blue-50/50" : "border-gray-300"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-blue-400 hover:bg-blue-50/30"}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="flex flex-col items-center text-center">
            {isDragging ? (
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Upload className="h-8 w-8 text-blue-500" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Camera className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <p className="text-sm text-center font-medium mb-1">
              {isDragging ? "Thả để tải lên" : "Kéo thả hoặc nhấp để tải lên"}
            </p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP (tối đa 5MB)</p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  )
}

