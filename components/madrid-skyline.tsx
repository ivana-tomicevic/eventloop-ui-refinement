/**
 * Madrid skyline under the Explore title: a flat silhouette of the palace, the Telefónica tower,
 * the Metropolis dome, the Puerta de Alcalá and a strawberry tree. Decorative only (aria-hidden).
 * It is drawn 2000px wide and never stretches: it spans the whole page width and is cropped from
 * the sides on narrower screens, so phones see the middle landmarks. Colour: --color-skyline. Styles: app/explore-header.css (.el-skyline).
 */
export default function MadridSkyline() {
  return (
    <svg
      className="el-skyline"
      viewBox="0 0 2000 80"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="currentColor">
        <rect x="0" y="76" width="2000" height="4" />
        {/* Low roofs left and right of the landmarks */}
        <rect x="0" y="58" width="90" height="18" />
        <rect x="90" y="48" width="60" height="28" />
        <rect x="150" y="62" width="110" height="14" />
        <rect x="260" y="52" width="70" height="24" />
        <rect x="330" y="60" width="80" height="16" />
        <rect x="410" y="46" width="50" height="30" />
        <rect x="1540" y="54" width="70" height="22" />
        <rect x="1610" y="44" width="50" height="32" />
        <rect x="1660" y="60" width="110" height="16" />
        <rect x="1770" y="50" width="60" height="26" />
        <rect x="1830" y="58" width="90" height="18" />
        <rect x="1920" y="48" width="80" height="28" />
        <g transform="translate(485 0)">
        <rect x="0" y="52" width="70" height="24" />
        <rect x="70" y="44" width="40" height="32" />
        <rect x="110" y="56" width="50" height="20" />
        {/* Royal Palace */}
        <rect x="170" y="48" width="140" height="28" />
        <rect x="170" y="34" width="18" height="14" />
        <rect x="292" y="34" width="18" height="14" />
        <polygon points="170,34 179,24 188,34" />
        <polygon points="292,34 301,24 310,34" />
        <path d="M215 48a25 25 0 0 1 50 0Z" />
        {/* Torre Telefónica */}
        <rect x="350" y="14" width="26" height="62" />
        <rect x="355" y="6" width="16" height="8" />
        <rect x="362" y="0" width="2" height="6" />
        {/* Edificio Metrópolis */}
        <rect x="410" y="46" width="80" height="30" />
        <path d="M420 46a30 30 0 0 1 60 0Z" />
        <rect x="446" y="14" width="8" height="6" />
        <polygon points="450,4 445,14 455,14" />
        {/* Puerta de Alcalá */}
        <path
          fillRule="evenodd"
          d="M540 42H670V76H540Z M556 76V60a8 8 0 0 1 16 0V76Z M591 76V52a14 14 0 0 1 28 0V76Z M638 76V60a8 8 0 0 1 16 0V76Z"
        />
        <polygon points="534,42 605,26 676,42" />
        <rect x="710" y="56" width="36" height="20" />
        <rect x="746" y="44" width="30" height="32" />
        <rect x="776" y="58" width="46" height="18" />
        {/* Strawberry tree */}
        <circle cx="850" cy="56" r="12" />
        <rect x="848" y="64" width="4" height="12" />
        <rect x="880" y="62" width="50" height="14" />
        <rect x="940" y="50" width="40" height="26" />
        <rect x="980" y="58" width="50" height="18" />
        </g>
      </g>
    </svg>
  );
}
