'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImageProps {
  slug: string;
  name: string;
  src?: string;
  className?: string;
}

export default function ProductImage({ slug, name, src, className = '' }: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  const imgSrc = src || `/images/products/${slug}.jpg`;

  if (hasError || !imgSrc) {
    return (
      <div className={`bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="text-5xl mb-2">❄️</div>
          <span className="text-xs text-blue-400 font-medium">Photo Coming Soon</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-blue-50 ${className}`}>
      <Image
        src={imgSrc}
        alt={name}
        fill
        className="object-contain p-4"
        onError={() => setHasError(true)}
        unoptimized
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  );
}
