'use client';

interface AnclaArtProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

export default function AnclaArt({ width = '100%', height = '100%', className }: AnclaArtProps) {
  return (
    <svg
      viewBox="0 0 600 700"
      width={width}
      height={height}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <defs>
        <radialGradient id="ancla-glow" cx="50%" cy="45%">
          <stop offset="0%"   stopColor="#A7C7E7" stopOpacity="0.55" />
          <stop offset="55%"  stopColor="#A7C7E7" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#A7C7E7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ancla-ribbon" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#7BA8CF" />
          <stop offset="60%"  stopColor="#5C8AB3" />
          <stop offset="100%" stopColor="#87B383" />
        </linearGradient>
      </defs>

      {/* Atmospheric glow */}
      <circle cx="300" cy="290" r="280" fill="url(#ancla-glow)" />

      {/* Water ripples at the foot */}
      <g opacity="0.55">
        <ellipse cx="300" cy="600" rx="220" ry="14" fill="none" stroke="#A7C7E7" strokeWidth="1.5" />
        <ellipse cx="300" cy="620" rx="170" ry="10" fill="none" stroke="#A7C7E7" strokeWidth="1.2" opacity="0.7" />
        <ellipse cx="300" cy="638" rx="120" ry="7"  fill="none" stroke="#A7C7E7" strokeWidth="1"   opacity="0.45" />
      </g>

      {/* Asymmetric ring — calligraphic, oversized, with watercolor halo behind */}
      <g transform="translate(60 80) scale(10)" stroke="#2C2C2A" fill="none" strokeLinecap="round">
        {/* Soft underwash halo */}
        <path
          d="M 32 6 C 19 5 6 13 6 25 C 6 38 17 44 28 43"
          stroke="#A7C7E7"
          strokeWidth="6"
          opacity="0.5"
          transform="translate(0.4 0.5)"
        />
        {/* The ring itself */}
        <path
          d="M 32 6 C 19 5 6 13 6 25 C 6 38 17 44 28 43"
          strokeWidth="3.2"
        />
      </g>

      {/* Descending ribbon — gradient stroke, curls at foot */}
      <path
        d="M 295 300 C 296 380 305 470 320 540 C 332 590 372 600 348 638 C 312 642 277 612 273 540"
        stroke="url(#ancla-ribbon)"
        strokeWidth="22"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.92"
      />

      {/* Center dot — dark outer, white inner */}
      <circle cx="295" cy="298" r="14" fill="#2C2C2A" />
      <circle cx="295" cy="298" r="5"  fill="#F5F2EE" />

      {/* Fireflies — 8 particles drifting in 2D with opacity flicker */}
      <g>
        <circle cx="120" cy="200" r="5" fill="#A7C7E7">
          <animate attributeName="cx" values="120;138;128;112;120" dur="11s" repeatCount="indefinite" />
          <animate attributeName="cy" values="200;186;172;192;200" dur="9s"  repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.2;0.85;0.4;0.95;0.2" dur="5.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="480" cy="240" r="3.5" fill="#B8D4B4">
          <animate attributeName="cx" values="480;466;490;476;480" dur="13s" repeatCount="indefinite" />
          <animate attributeName="cy" values="240;258;232;250;240" dur="10s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.9;0.45;0.85;0.3" dur="6.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="460" cy="420" r="5" fill="#A7C7E7">
          <animate attributeName="cx" values="460;478;448;466;460" dur="14s" repeatCount="indefinite" />
          <animate attributeName="cy" values="420;404;432;414;420" dur="8.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.25;0.8;0.35;0.9;0.25" dur="7s" repeatCount="indefinite" />
        </circle>
        <circle cx="120" cy="430" r="3" fill="#B8D4B4">
          <animate attributeName="cx" values="120;104;130;114;120" dur="12s" repeatCount="indefinite" />
          <animate attributeName="cy" values="430;414;444;420;430" dur="9.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.85;0.4;0.9;0.3" dur="5.8s" repeatCount="indefinite" />
        </circle>
        <circle cx="510" cy="120" r="3" fill="#A7C7E7">
          <animate attributeName="cx" values="510;494;520;504;510" dur="15s" repeatCount="indefinite" />
          <animate attributeName="cy" values="120;138;108;130;120" dur="11.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.2;0.75;0.35;0.85;0.2" dur="6.6s" repeatCount="indefinite" />
        </circle>
        <circle cx="80" cy="320" r="2.5" fill="#A7C7E7">
          <animate attributeName="cx" values="80;96;72;88;80"     dur="10.5s" repeatCount="indefinite" />
          <animate attributeName="cy" values="320;306;334;312;320" dur="13.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.9;0.5;0.85;0.3" dur="4.8s" repeatCount="indefinite" />
        </circle>
        <circle cx="280" cy="80" r="2.5" fill="#B8D4B4">
          <animate attributeName="cx" values="280;266;294;276;280" dur="12.8s" repeatCount="indefinite" />
          <animate attributeName="cy" values="80;94;68;90;80"      dur="10.1s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.2;0.8;0.4;0.95;0.2" dur="5.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="380" cy="500" r="3" fill="#A7C7E7">
          <animate attributeName="cx" values="380;396;362;390;380" dur="11.6s" repeatCount="indefinite" />
          <animate attributeName="cy" values="500;484;514;492;500" dur="9.8s"  repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.85;0.45;0.9;0.3" dur="6.4s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  );
}
