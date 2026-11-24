# Project editing reminders

- Build game views and interactions with React and TypeScript in `.tsx`. Style them with Tailwind utilities. Put reusable utility strings and state selectors in `src/ui-classes.ts` and keep full utility names as literals so Tailwind can detect them.
- Reuse existing artwork and components before generating replacements. Both games share bathroom artwork, supplies, and bandage placement from `src/bath-scene.tsx`. The Brush Teeth intro and finish overlay `public/shared/brush-finish-mouth.webp`, a lossless crop of the approved mouth reference, on the original character sprite.
- For Bedtime clothing, follow `skills/bedtime-outfits/SKILL.md` and its reusable prompt in `skills/bedtime-outfits/references/outfit-prompts.md`. Apply its strict art-style reference in `skills/bedtime-outfits/references/art-style.md` to every new asset. Check the neckline, shoulders, wrists, and sock joins on the worn character before accepting a fit. Cuffs should end above the hands.
- When replacing an asset, update its consumers in the same change and remove the superseded file and any notes or code that exist only for that file. Search the whole source tree for the filename and stem. Check HTML preloads, CSS and SVG URLs, image-loading lists, dynamic paths, and other routes before deleting. Keep shared assets, assets used in other states, and licenses for retained assets.
- Run `npm run build` after cleanup. Check affected routes and states at desktop and narrow widths when making visual changes. See `PROJECT_GUIDE.md` for the routes and saved progress conventions.

- Measure performance changes before and after. Preserve asset dimensions, alpha, sprite coordinates, saved progress and the approved lossless mouth crop. Limit Tailwind scanning to runtime source and route HTML. Keep reusable asset prompts current with the latest fitting decisions.

- Asset replacement includes automatic cleanup: after updating every consumer and checking dynamic paths and other states, delete the superseded source file in the same task. Do not leave versioned backups or generated candidates in shipped folders. Preserve shared art and licenses. Never edit dist directly; npm run build regenerates it from source. Keep assets grouped by purpose using the layout in PROJECT_GUIDE.md.

- Fit Bedtime sleeves around the unchanged character arms. Do not hide or cut away arms to compensate for a narrow garment. Use Sleepy Cat as the approved sleeve, wrist-cuff and pant-to-sock transition reference.

- Keep the full Schoolbell WOFF2 font and its license in public/fonts. Update all four HTML preloads with any font-path replacement; do not ship the superseded TTF or subset away supported characters. Keep caches and QA output out of Git and deployment uploads.
