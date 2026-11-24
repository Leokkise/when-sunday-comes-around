import { ui } from './ui-classes'
import { brushedEnamelOpacity, EnamelMask, frontArt } from './tooth-coating'

const biteLine = "M0 442 L75 445 Q125 481 181 456 Q234 485 291 461 Q345 486 393 461 Q449 493 493 451 Q520 484 546 492 Q579 490 596 457 Q648 493 720 465 Q790 501 887 470 Q978 501 1059 465 Q1120 493 1178 456 Q1197 489 1228 492 Q1258 486 1283 451 Q1327 493 1381 461 Q1432 486 1485 461 Q1540 485 1595 456 Q1652 481 1700 445 L1774 442"
const tongueShape = "M570 450 C615 400 710 428 795 438 C877 449 926 439 934 499 C945 440 991 448 1082 437 C1166 427 1250 405 1295 453 C1336 504 1270 557 1205 581 C1141 604 1034 627 937 626 C826 626 716 606 649 577 C590 550 532 490 570 450 Z"
const mouthTransform = 'translate(53 36) scale(.94 .89)'
const tongueTransform = 'translate(0 -94) scale(1 1.25)'
export function TongueMouth({ progress }: { progress: number }) {
  const cleanEdge = 1.18 * progress
  const finished = progress >= 1
  return <svg className={ui("brush-tooth-coating")} viewBox="0 0 1774 887" role="img" aria-label="Clean teeth and pink gums with the tongue visible">
    <defs>
      <EnamelMask id="brush-open-enamel-mask" width={1774} height={887} />
      <g id="brush-clean-jaws">
        <image href={frontArt} width="1774" height="887" />
        <rect width="1774" height="887" fill="#fff" opacity={brushedEnamelOpacity} mask="url(#brush-open-enamel-mask)" />
      </g>
      <clipPath id="brush-upper-jaw">
        <path d={`${biteLine} V0 H0 Z`} />
      </clipPath>
      <clipPath id="brush-lower-jaw">
        <path d={`${biteLine} V887 H0 Z`} />
      </clipPath>
      <clipPath id="brush-tongue-shape">
        <path d={tongueShape} />
      </clipPath>
      <linearGradient id="brush-open-mouth-shadow" x2="0" y2="1">
        <stop stopColor="#7d4648" />
        <stop offset="1" stopColor="#4e2d33" />
      </linearGradient>
      <filter id="brush-tongue-color" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="1 0 0 0 .045  0 .81 0 0 .025  0 0 .94 0 .05  0 0 0 1 0" />
      </filter>
      <linearGradient id="brush-tongue-coating" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="415" y2="630">
        <stop offset={Math.max(0, cleanEdge - .18)} stopColor="#ead4b4" stopOpacity="0" />
        <stop offset={Math.min(1, cleanEdge)} stopColor="#ead4b4" stopOpacity=".66" />
      </linearGradient>
    </defs>
    <g transform={mouthTransform}>
      <path d="M55 322 C34 371 39 491 72 558 C164 645 1588 651 1702 558 C1735 490 1740 371 1721 322 Z" fill="url(#brush-open-mouth-shadow)" />
      <g transform="translate(0 80)" clipPath="url(#brush-lower-jaw)">
        <use href="#brush-clean-jaws" />
      </g>
      <g transform={tongueTransform}>
        <g clipPath="url(#brush-tongue-shape)">
          <image href="/brush/tongue-source.webp" width="1747" height="900" filter="url(#brush-tongue-color)" />
          {!finished && <path d={tongueShape} fill="url(#brush-tongue-coating)" />}
        </g>
        <path d={tongueShape} fill="none" stroke="#845559" strokeWidth="7" />
      </g>
      <g transform="translate(0 -54)" clipPath="url(#brush-upper-jaw)">
        <use href="#brush-clean-jaws" />
      </g>
    </g>
  </svg>
}
