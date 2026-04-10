"use client"

import { useState } from "react"
import Image from "next/image"

interface ListingImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  width?: number
  height?: number
  fill?: boolean
}

export function ListingImage({ src, alt, className, width, height, fill }: ListingImageProps) {
  const [error, setError] = useState(false)

  if (error || !src) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className || ""}`}>
        <span className="text-muted-foreground text-xs">No image</span>
      </div>
    )
  }

  if (fill) {
    return <Image src={src || "/placeholder.svg"} alt={alt} fill className={className} onError={() => setError(true)} />
  }

  return (
    <Image
      src={src || "/placeholder.svg"}
      alt={alt}
      width={width || 64}
      height={height || 64}
      className={className}
      onError={() => setError(true)}
    />
  )
}
