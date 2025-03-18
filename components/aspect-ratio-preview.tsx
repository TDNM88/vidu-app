"use client"

import { useState, useEffect } from "react"

type AspectRatio = "vertical" | "horizontal" | "square"

interface AspectRatioPreviewProps {
  aspectRatio: AspectRatio
  mainCharacterSrc?: string | null
  backgroundSrc?: string | null
}

export function AspectRatioPreview({ aspectRatio, mainCharacterSrc, backgroundSrc }: AspectRatioPreviewProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    switch (aspectRatio) {
      case "vertical":
        setDimensions({ width: 9, height: 16 })
        break
      case "horizontal":
        setDimensions({ width: 16, height: 9 })
        break
      case "square":
        setDimensions({ width: 1, height: 1 })
        break
      default:
        setDimensions({ width: 16, height: 9 })
    }
  }, [aspectRatio])

  const containerStyle = {
    aspectRatio: `${dimensions.width} / ${dimensions.height}`,
  }

  return (
    <div
      className="relative w-full max-w-xs mx-auto border border-gray-200 rounded-lg overflow-hidden bg-gray-50 shadow-md"
      style={containerStyle}
    >
      {backgroundSrc ? (
        <div className="absolute inset-0">
          <img src={backgroundSrc || "/placeholder.svg"} alt="Bối cảnh" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="text-gray-400 text-sm font-medium">Bối cảnh</span>
        </div>
      )}

      {mainCharacterSrc && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-1/2 h-1/2 filter drop-shadow-lg">
            <img
              src={mainCharacterSrc || "/placeholder.svg"}
              alt="Nhân vật chính"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2.5 py-1.5 rounded-full font-medium">
        {dimensions.width}:{dimensions.height}
      </div>
    </div>
  )
}

