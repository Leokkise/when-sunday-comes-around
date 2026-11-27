import { ui } from './ui-classes'

export function ActivityBackLink() {
  return <a className={ui('brush-back hoops-back')} href="/" aria-label="Back to When Sunday Comes Around">
    <svg className={ui('ink-wiggle')} viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <path d="M29 18c-5 1-14 0-22 0m0 0 8-8m-8 8 8 8" />
    </svg>
  </a>
}
