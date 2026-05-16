'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    FB?: {
      XFBML: { parse: (el?: HTMLElement) => void };
      init: (opts: object) => void;
    };
    fbAsyncInit?: () => void;
  }
}

interface FacebookFeedProps {
  tabs?: 'timeline' | 'events' | 'messages';
  height?: number;
  smallHeader?: boolean;
}

export default function FacebookFeed({
  tabs = 'timeline',
  height = 500,
  smallHeader = false,
}: FacebookFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadSDK = () => {
      if (document.getElementById('facebook-jssdk')) {
        window.FB?.XFBML.parse(containerRef.current ?? undefined);
        return;
      }
      window.fbAsyncInit = function () {
        window.FB?.init({ xfbml: true, version: 'v19.0' });
      };
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    };
    loadSDK();
  }, []);

  return (
    <div ref={containerRef}>
      <div
        className="fb-page"
        data-href="https://www.facebook.com/gocleanaircon"
        data-tabs={tabs}
        data-width="500"
        data-height={height}
        data-small-header={smallHeader}
        data-adapt-container-width="true"
        data-hide-cover="false"
        data-show-facepile="true"
      />
    </div>
  );
}
