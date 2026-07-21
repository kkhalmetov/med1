'use client'

import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'

export interface ProtectedImageProps extends Omit<ImageProps, 'src' | 'onError'> {
  src: string | null | undefined
  fallbackSrc?: string
}

export function ProtectedImage({
  src,
  fallbackSrc = '/icons/qadamm-q.svg',
  alt,
  ...props
}: ProtectedImageProps) {
  const initialSource = src || fallbackSrc
  const [source, setSource] = useState(initialSource)

  return (
    <Image {...props} alt={alt} onError={() => setSource(fallbackSrc)} src={source} unoptimized />
  )
}
