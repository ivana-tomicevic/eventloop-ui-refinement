/**
 * Hand-drawn style Madrid next to the Explore title: a sun behind the Royal Palace, a domed church,
 * the KIO towers, the Puerta de Alcalá and the bear with the strawberry tree. Decorative only
 * (aria-hidden). Colours come from the --color-illus-* tokens; fills and strokes are set as CSS
 * (style) so var() works everywhere. Styles: app/explore-header.css (.el-madrid-illus).
 */
const fill = (token: string) => ({ fill: `var(${token})` });

export default function MadridIllustration() {
  return (
    <svg
      className="el-madrid-illus"
      viewBox="0 0 680 250"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="330" cy="135" r="125" style={fill("--color-illus-sun-glow")} />
      <circle cx="330" cy="135" r="92" style={fill("--color-illus-sun")} />
      <g fillOpacity="0.88" transform="translate(5 4)">
        <path
          style={fill("--color-illus-rose")}
          d="M48 122H142V200H48Z M78 92H112V122H78Z M84 70H106V92H84Z"
        />
        <path
          style={fill("--color-illus-apricot")}
          d="M176 132H246V200H176Z M190 132C190 108 232 108 232 132Z"
        />
        <path
          style={fill("--color-illus-mauve")}
          d="M276 200L312 62H330L297 200Z M396 200L360 62H342L375 200Z M308 54H364V66H308Z"
        />
        <path
          style={fill("--color-illus-coral")}
          d="M412 148H524V200H412Z M432 132H504V148H432Z M452 132L468 118L484 132Z"
        />
        <path
          style={fill("--color-illus-blush")}
          d="M566 160C556 150 562 132 578 134C580 120 604 118 610 132C626 132 632 152 618 160C606 168 576 168 566 160Z"
        />
        <ellipse cx="608" cy="186" rx="8" ry="14" style={fill("--color-illus-bear")} />
      </g>
      <g
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ stroke: "var(--color-illus-line)" }}
      >
        <path d="M16 201C120 199 220 203 340 201S560 199 664 201" />
        <path d="M48 200V122H142V200" />
        <path d="M44 122H146" />
        <path d="M78 122V92H112V122" />
        <path d="M84 92V70H106V92" />
        <path d="M95 70V40" />
        <path d="M89 70L95 52L101 70" />
        <circle cx="95" cy="106" r="5" />
        <path d="M62 138V152M78 138V152M94 138V152M110 138V152M126 138V152" />
        <path d="M62 168V182M78 168V182M94 168V182M110 168V182M126 168V182" />
        <path d="M176 200V132H246V200" />
        <path d="M172 132H250" />
        <path d="M190 132C190 108 232 108 232 132" />
        <path d="M204 112V102H218V112" />
        <path d="M211 102V90M205 97L211 88L217 97" />
        <path d="M190 148V198M204 148V198M218 148V198M232 148V198" />
        <path d="M276 200L312 62H330L297 200Z" />
        <path d="M396 200L360 62H342L375 200Z" />
        <path d="M308 62V54H364V62" />
        <path d="M300 150H314M292 168H308M304 120H320M298 182H310" />
        <path d="M386 150H372M394 168H378M382 120H366M390 182H376" />
        <path d="M412 200V148H524V200" />
        <path d="M408 148H528" />
        <path d="M432 148V132H504V148" />
        <path d="M452 132L468 118L484 132" />
        <path d="M458 200V170a10 10 0 0 1 20 0V200" />
        <path d="M432 200V180a8 8 0 0 1 16 0V200" />
        <path d="M488 200V180a8 8 0 0 1 16 0V200" />
        <path d="M424 156V200M512 156V200" />
        <path d="M441 126V122M468 114V108M495 126V122" />
        <path d="M588 200V168" />
        <path d="M566 160C556 150 562 132 578 134C580 120 604 118 610 132C626 132 632 152 618 160C606 168 576 168 566 160Z" />
        <path d="M600 200V184C600 170 616 170 616 184V200" />
        <circle cx="608" cy="168" r="5" />
      </g>
    </svg>
  );
}
