import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sizeParam = searchParams.get('size');
  const maskable = searchParams.get('maskable') === 'true';

  // Supported sizes: 32, 192, 512
  const validSizes = [32, 192, 512];
  const requestedSize = sizeParam ? parseInt(sizeParam) : 32;
  const iconSize = validSizes.includes(requestedSize) ? requestedSize : 32;

  // Scale inner elements proportionally
  const innerDotSize = Math.round(iconSize * 0.375); // 37.5% of icon size
  const glowSize = Math.round(iconSize * 0.3125); // 31.25% for glow spread

  // Maskable icons need 40% safe zone padding
  // The visible icon should be 60% of the total size, centered
  const maskablePadding = maskable ? iconSize * 0.2 : 0;
  const visibleSize = maskable ? iconSize * 0.6 : iconSize;
  const visibleDotSize = maskable ? Math.round(visibleSize * 0.375) : innerDotSize;

  return new ImageResponse(
    <div
      style={{
        background: '#022c22', // Match app background for maskable
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: maskable ? `${maskablePadding}px` : '0',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(to bottom right, #14b8a6, #059669)',
          width: maskable ? `${visibleSize}px` : '100%',
          height: maskable ? `${visibleSize}px` : '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          boxShadow: `0 0 ${glowSize}px rgba(20, 184, 166, 0.5)`,
        }}
      >
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            width: `${maskable ? visibleDotSize : innerDotSize}px`,
            height: `${maskable ? visibleDotSize : innerDotSize}px`,
            borderRadius: '50%',
            boxShadow: `0 0 ${Math.round(glowSize / 2)}px rgba(255, 255, 255, 0.8)`,
          }}
        />
      </div>
    </div>,
    {
      width: iconSize,
      height: iconSize,
    }
  );
}
