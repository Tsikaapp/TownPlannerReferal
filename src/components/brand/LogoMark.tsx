import { useId } from 'react';

export interface LogoMarkProps {
  /** Rendered size in px. The mark is drawn on a 240 grid and scales cleanly. */
  size?: number;
  /**
   * `color` is the mark on a light ground. `onDark` swaps the forest-green hand
   * for white, the way the app-icon lockup does.
   */
  tone?: 'color' | 'onDark';
  /**
   * Colour of the hairline that separates the two hands. It has to match
   * whatever sits behind the mark, so pass the background colour when the mark
   * is not on white.
   */
  halo?: string;
  className?: string;
  title?: string;
}

/**
 * The PlanLink mark: a split forest/gold ring, a gold skyline, and two clasped
 * hands. Drawn as vectors rather than shipped as a bitmap so it stays sharp at
 * favicon size and can be recoloured for dark headers.
 */
export default function LogoMark({
  size = 40,
  tone = 'color',
  halo = '#ffffff',
  className,
  title,
}: LogoMarkProps) {
  const uid = useId().replace(/:/g, '');
  const gold = `pl-gold-${uid}`;
  const disc = `pl-disc-${uid}`;
  const hand = tone === 'onDark' ? '#ffffff' : '#0B4A2F';
  const ring = tone === 'onDark' ? '#ffffff' : '#0B4A2F';

  return (
    <svg
      viewBox="0 0 240 240"
      width={size}
      height={size}
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id={gold} x1="0" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#EBC963" />
          <stop offset="0.45" stopColor="#D9A62A" />
          <stop offset="1" stopColor="#B8860F" />
        </linearGradient>
        <clipPath id={disc}>
          <circle cx="120" cy="108" r="98.5" />
        </clipPath>
      </defs>

      {/* Split ring */}
      <path d="M113.57 16.19 A92 92 0 0 0 71.25 186.02" stroke={ring} strokeWidth="13" fill="none" />
      <path d="M126.42 16.19 A92 92 0 0 1 168.75 186.02" stroke={`url(#${gold})`} strokeWidth="13" fill="none" />

      {/* Skyline */}
      <g stroke={`url(#${gold})`} strokeWidth="5" fill="none" strokeLinejoin="miter">
        <path d="M70 118 L70 99 L89 99 L89 76 L112 60 L112 118" />
        <path d="M126 118 L126 52 L149 68 L149 95 L170 95 L170 118" />
      </g>

      <g clipPath={`url(#${disc})`}>
        {/* Gold fingertips emerging under the near arm */}
        <g fill={`url(#${gold})`} stroke={halo} strokeWidth="5">
          <rect x="42" y="142" width="28" height="16" rx="8" transform="rotate(30 56 150)" />
          <rect x="57" y="155" width="28" height="16" rx="8" transform="rotate(30 71 163)" />
          <rect x="73" y="167" width="27" height="16" rx="8" transform="rotate(30 86 175)" />
          <rect x="89" y="178" width="26" height="16" rx="8" transform="rotate(30 102 186)" />
        </g>

        {/* Gold forearm and back of hand */}
        <path
          d="M246 104 C214 84 174 84 148 100 C132 110 118 124 110 138 C104 150 108 162 118 164
             C130 166 138 154 150 144 C172 126 212 132 244 158 Z"
          fill={`url(#${gold})`}
        />

        {/* Near forearm and fist */}
        <path
          d="M-8 104 C34 96 78 110 110 126 C126 134 140 128 152 132 C173 139 183 156 174 173
             C164 191 137 190 117 181 C85 158 38 143 -8 146 Z"
          fill={halo}
          stroke={halo}
          strokeWidth="10"
          strokeLinejoin="round"
        />
        <path
          d="M-8 104 C34 96 78 110 110 126 C126 134 140 128 152 132 C173 139 183 156 174 173
             C164 191 137 190 117 181 C85 158 38 143 -8 146 Z"
          fill={hand}
        />

        {/* Fingers wrapping the far hand */}
        <g fill="none" strokeLinecap="round">
          <g stroke={halo} strokeWidth="22">
            <path d="M156 134 Q186 138 199 156" />
            <path d="M152 153 Q182 159 193 178" />
            <path d="M143 170 Q171 178 179 197" />
            <path d="M130 184 Q154 194 160 212" />
          </g>
          <g stroke={hand} strokeWidth="14">
            <path d="M156 134 Q186 138 199 156" />
            <path d="M152 153 Q182 159 193 178" />
            <path d="M143 170 Q171 178 179 197" />
            <path d="M130 184 Q154 194 160 212" />
          </g>
        </g>

        {/* Far thumb hooking over the clasp */}
        <path d="M157 105 C135 117 113 133 103 152" fill="none" stroke={halo} strokeWidth="40" strokeLinecap="round" />
        <path d="M157 105 C135 117 113 133 103 152" fill="none" stroke={`url(#${gold})`} strokeWidth="30" strokeLinecap="round" />
      </g>
    </svg>
  );
}
