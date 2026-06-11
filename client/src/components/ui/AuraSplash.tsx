import { useEffect, useState } from 'react';
import './AuraSplash.css';

export default function AuraSplash({ onComplete }: { onComplete: () => void }) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Start fade out after 2.6s (completing at 3s)
    const fadeTimer = setTimeout(() => {
      setFade(true);
    }, 2600);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className={`aura-splash-overlay ${fade ? 'fade-out' : ''}`}>
      <video
        className="aura-splash-video"
        src="https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c054e0c90c749000a6e54e4e9cfb3e15&profile_id=165&oauth2_token_id=57447761"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="aura-splash-content">
        <div className="aura-splash-logo-container">
          <span className="aura-splash-star">✦</span>
          <div className="aura-splash-text-group">
            <h1 className="aura-splash-title">AURA</h1>
            <div className="aura-splash-bar" />
            <p className="aura-splash-tagline">Private Concierge</p>
          </div>
        </div>
      </div>
    </div>
  );
}
