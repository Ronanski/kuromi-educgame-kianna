// "Noxie" — an ORIGINAL goth-cute kitty mascot (white face, black cat-ear hood,
// pink bow, little devil tail). Not based on any licensed character.
// Do not add skull marks, jester hoods or names of existing characters.
// Parents can swap in their own picture on-device (see app.js "custom mascot").

export const NOXIE_NAME = 'Noxie';

export function noxieSVG() {
  return `
<svg class="noxie" viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Noxie">
  <g class="tail"><path d="M140 190 C176 186 182 160 170 146" stroke="#1e1726" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M170 130 L160 150 L182 148 Z" fill="#1e1726"/></g>
  <ellipse cx="100" cy="186" rx="42" ry="30" fill="#1e1726"/>
  <ellipse cx="100" cy="192" rx="20" ry="14" fill="#f7a8d0"/>
  <g class="hood">
    <path d="M44 74 L52 18 L88 52 Z" fill="#1e1726"/>
    <path d="M156 74 L148 18 L112 52 Z" fill="#1e1726"/>
    <path d="M54 66 L58 32 L80 54 Z" fill="#f7a8d0"/>
    <path d="M146 66 L142 32 L120 54 Z" fill="#f7a8d0"/>
    <circle cx="100" cy="112" r="66" fill="#1e1726"/>
  </g>
  <g transform="translate(150 40) rotate(20)">
    <path d="M0 0 L-18 -11 L-18 11 Z" fill="#ff5fa2"/>
    <path d="M0 0 L18 -11 L18 11 Z" fill="#ff5fa2"/>
    <circle r="5.5" fill="#ffc2dc"/>
  </g>
  <ellipse cx="100" cy="126" rx="50" ry="44" fill="#fffafc"/>
  <g class="eyes">
    <ellipse cx="80" cy="120" rx="11" ry="14" fill="#2b1840"/>
    <ellipse cx="120" cy="120" rx="11" ry="14" fill="#2b1840"/>
    <circle cx="84" cy="115" r="4" fill="#fff"/>
    <circle cx="124" cy="115" r="4" fill="#fff"/>
    <path d="M66 102 L90 108" stroke="#2b1840" stroke-width="4" stroke-linecap="round"/>
    <path d="M134 102 L110 108" stroke="#2b1840" stroke-width="4" stroke-linecap="round"/>
  </g>
  <ellipse cx="66" cy="140" rx="8" ry="5" fill="#f78fb3" opacity=".8"/>
  <ellipse cx="134" cy="140" rx="8" ry="5" fill="#f78fb3" opacity=".8"/>
  <path d="M96 134 L104 134 L100 139 Z" fill="#ff5fa2"/>
  <path class="mouth" d="M88 144 Q94 151 100 144 Q106 151 112 144" stroke="#2b1840" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M104 147 l3 6 l3 -6" fill="#fff" stroke="#2b1840" stroke-width="1"/>
  <g stroke="#2b1840" stroke-width="2" stroke-linecap="round" opacity=".7">
    <path d="M58 132 L40 128"/><path d="M58 138 L40 140"/>
    <path d="M142 132 L160 128"/><path d="M142 138 L160 140"/>
  </g>
</svg>`;
}
