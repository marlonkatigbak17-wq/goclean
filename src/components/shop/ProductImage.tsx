'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImageProps {
  slug: string;
  name: string;
  className?: string;
}

export default function ProductImage({ slug, name, className = '' }: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
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
        src={`/images/products/${slug}.jpg`}
        alt={name}
        fill
        className="object-contain p-4"
        onError={() => setHasError(true)}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  );
}
