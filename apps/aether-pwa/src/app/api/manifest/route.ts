import { NextResponse } from 'next/server';
import { MetadataRoute } from 'next';

export function GET(): NextResponse {
  const manifest: MetadataRoute.Manifest = {
    name: 'Aether',
    short_name: 'Aether',
    description: 'Voice-First Empathetic Companion',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#022c22',
    theme_color: '#022c22',
    icons: [
      {
        src: '/api/icon?size=32',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/api/icon?size=192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/api/icon?size=512',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/api/icon?size=512&maskable=true',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/api/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };

  return NextResponse.json(manifest);
}
