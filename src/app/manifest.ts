import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GoClean Aircon Supplies & Services',
    short_name: 'GoClean',
    description: 'Your trusted HVAC partner. Shop aircon units, book services, and track orders.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1a5ff0',
    theme_color: '#1a5ff0',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  };
}
