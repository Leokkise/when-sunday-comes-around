# When Sunday Comes Around

This project teaches everyday self-care through short, interactive games for kids. The visual baseline is a colored-pencil illustration style with paper textures, muted colors, and handwritten type. Keep on-screen instructions short and show the next action where the child needs it.

## Run the project

- Run `npm ci` to install the locked dependencies.
- Run `npm run dev` to start Vite.
- Run `npm run build` for the TypeScript check and production build.

React and TypeScript power the interactions. Vite builds four HTML entry points. Use Tailwind utilities in TSX for styling. Shared utility sets and selector variants live in `src/ui-classes.ts`; preserve this single source rather than introducing route copies. The single Tailwind entry, `src/index.css`, registers the Schoolbell font and custom animation keyframes.

| Route | Main source | Current role |
| --- | --- | --- |
| `/` | `src/main.tsx` | Three illustrated game cards with short, child-friendly labels |
| `/wash-up/` | `src/wash-up.tsx` | Nine guided bath steps, followed by a link to brushing |
| `/brush-teeth/` | `src/brush-teeth.tsx` | Bath-to-brushing intro and five guided brushing steps |
| `/dress-up/` | `src/dress-up.tsx` | Bedtime outfit choices and live bedroom preview |

## Current game design

**Wash Up** walks through picking out leaves, wetting hair, shampooing, rinsing hair and wetting the body, soaping, scrubbing, rinsing, drying, and bandaging. The finished scene shows a clean character with sparkles and offers a link to Brush Up.

**Brush Up** opens with the clean, full-body character and the “Bath done! Brush time!” speech bubble. The intro button plays the full-screen toothpaste transition. Applying toothpaste during the game uses a separate animation inside the sink scene. The child adds toothpaste, brushes the outside of the top teeth, brushes the outside of the bottom teeth, brushes the tongue, and spits into the sink. A sparkle marks each completed row. Before the tongue step, a short tip reminds kids to brush the insides and chewing surfaces at home. Checkpoints from the former inside and chewing rounds resume at the tongue. The three counter items support pointer interaction and keyboard selection. Finish returns to the shared clean bathroom scene, where “Choose pajamas” sweeps a colored-pencil night quilt over the page and opens Bedtime and “Play again” restarts brushing.

**Bedtime** reuses the smiling character and bandages from `src/bath-scene.tsx` with `public/bedtime/pajama-bedroom.webp` behind them. On wide screens the 4:3 bedroom scene sits to the left of the picker. The title and action align with the top and bottom of the scene, and the garment grid scrolls inside the picker. At narrower widths the scene stacks above the picker. Kids can select a whole outfit or mix its pieces. The picker lists available garments plus independent hats, hoods and sleep masks. Outfit selections last for the current visit. The Bedtime loading screen continues the illustrated quilt handoff and lifts away when the room is ready. The click transition is portaled directly to the document body so it stays outside the finish message box. Reduced-motion navigation opens the room directly.

The thirteen illustrated sets are in `assets/bedtime/`. `src/bedtime-outfits.tsx` registers their atlas positions for garment-only tiles and worn layers. Vite includes the content hash in each production atlas URL so revised artwork loads with the matching picker. The Cherry Checks and Mushroom Checks sets have nightcaps and separate high-resolution sleep masks. Moonlight Plaid, Cozy Fair Isle, Yarn Cat, and Cocoa Puppy each include a top, pants, and matching socks. Yarn Cat and Cocoa Puppy also have matching sleep masks. Nightcaps and hoods share the Hats & hoods category. Use the [Bedtime outfits skill](skills/bedtime-outfits/SKILL.md) to turn future references into fitted layers. Its packing script, registration guides, and ImageGen prompts accompany it.

<details>
<summary>Bedroom illustration prompt</summary>

The built-in ImageGen tool softened the haze on the previous bedroom illustration. The artwork fills its frame edge to edge. The cream border is 3 px on phones and 5 px on wider screens, styled in `src/ui-classes.ts`.

> Make a minimal tonal adjustment to this exact 4:3 colored-pencil bedroom background for a children's game. The user likes the soft foggy blue atmosphere and wants it just a little less foggy. Reduce the pale bluish veil by only about one fifth, introducing a small increase in local definition in the bed folds, chair, and floor while keeping the same gentle palette, soft shadows, pencil grain and medium-light blue nighttime atmosphere. Keep the overall exposure nearly the same, and leave a noticeable amount of the original dreamy haze throughout. Preserve the identical composition and geometry, all furniture and props, crop, small faint crescent by the window’s right edge and soft moonlight where they are. This should read as the same illustration at a slightly clearer setting. No added objects, sharper outlines, heavy contrast, larger moon, brighter light effects, border, characters, text, extra stars or interface. Full-bleed landscape illustration.

</details>

The approved Brush Up front view uses `public/brush/brush-pencil-slim-laterals.webp`. It has a closed bite, pencil-textured pink gums, 14 teeth per row, and slimmer upper lateral incisors beside the large center pair. The tongue round uses `public/brush/tongue-source.webp`. `src/tooth-coating.tsx` draws the removable tint and food stains. The brush, toothpaste, glass, and organizer are separate assets.

Each outside brushing round uses three areas per row: five teeth on the left, four in front, and five on the right. Each tooth earns its own progress, and a guide moves on only after every tooth in the current area is brushed. `src/brush-sections.ts` shares tooth positions across hit detection and artwork and carries saved area progress forward. The tongue still has one guide.

The games use `src/activity-loading.tsx` after React loads. Each route preloads and decodes only the artwork required for its opening or restored scene, including its CSS backgrounds, sprites and cursors. The scene mounts behind the loader until its eager images and Schoolbell font are ready and a frame has rendered. Lazy picker thumbnails do not hold this loader open. `src/image-loading.ts` shares image promises and clears failed entries so retries work. Load later-round and outfit artwork before switching to it, instead of adding everything to the entry loader. The initial loading screens use Tailwind classes in their HTML entry points and link the shared CSS. Shared sparkle illustrations live in `src/character-shine.tsx`.

Wash Up keeps the bathroom and character mounted when the last bandage is placed so the sparkles continue without restarting. Both games ease in their completion view when motion is enabled. In Brush Up, the raised glass pours onto the center front teeth, and the runoff follows the foam into the sink. The sink ripple starts when the runoff reaches the basin. Keep the water and foam timings within `spitTime` in `src/brush-teeth.tsx`. The regular and reduced-motion pour share a pose in `src/ui-classes.ts`.

## Guidelines for the next editor

- Read the relevant route and check the current artwork in the game before editing. Keep approved artwork and flows in scope when applying a targeted change.
- If the mouth framing or tooth placement changes, check the brush target circles in `src/brush-teeth.tsx` and the tint regions, stain coordinates, and enamel mask in `src/tooth-coating.tsx` together. Check a partially brushed row as well as a fresh one.
- Keep pointer, touch, keyboard, and reduced-motion behavior working. Check the intro transition and the in-scene toothpaste animation independently when touching either one.
- Progress is saved locally. Wash Up uses `when-sunday-comes-around.wash-up.v1` and Brush Up uses `when-sunday.brush-teeth.v2`. Brush Up's saved step IDs differ from the displayed sequence. Preserve compatibility with existing saves when changing steps or target counts.
- Before removing a public asset, check references in HTML preloads, CSS URLs, SVG references, image-loading lists, and dynamically constructed classes or paths. Keep the Schoolbell license with its font.
- Keep complete Tailwind utility names as literals so the build can detect them. Semantic class names also support state selectors and interaction hooks, so check their uses before renaming them.
- After changes, run the build and open the affected route. For visual changes, check at desktop and narrow widths. For interaction changes, check the normal entry point, progress, and Start over.
- Update this guide when the user asks. Record approved behavior, asset locations, and decisions a future editor needs.

The home page uses compressed scene previews. Additional masks and hats are independent choices in the existing accessory categories. The Ready for bed button uses a white hover background with brown text and keeps its position.

## Asset and code maintenance

Keep readable React/TypeScript source and let Vite minify production code. Tailwind scans src and the four HTML entry points. ActivityEntry deduplicates image URLs and accounts for scene/font readiness in its progress. Preserve retry, saved scenes and reduced-motion behavior.

The Bedtime skill includes reusable pajama and accessory repair prompts plus a strict art-style reference. Supply actual approved style images to ImageGen and identify each reference's role. src/bedtime-outfits.tsx is authoritative for current bounds, part lists and hair occlusion. Bunny Dreams and Buttercup Puppy hoods share worn bounds. Gray Cat uses a rounded crown and fitted band. Pink Cat was removed. New accessories keep visible pencil crosshatching and delicate graphite edges. Preserve approved positioning during texture-only repairs.

For compression, compare bytes and decoded image quality across all games. Preserve dimensions, alpha, sprite registration, licenses and the approved lossless brush-finish-mouth crop. Retain a smaller candidate only when pencil texture and contours hold up at actual display size. Already-efficient artwork may remain unchanged. Avoid repeated lossy recompression and keep generation/QA scratch files outside shipped asset folders. Verify all affected routes, saved states and narrow layouts. Publishing remains a separate user-requested action.

The November 23, 2026 compression pass reduced 16 images from 2,067,780 to 1,396,064 bytes (671,716 bytes saved). Candidates retained identical decoded alpha and dimensions, with visible RGB RMS error below 2/255 when composited on white. The lossless mouth crop and already-efficient images were retained. Shared CSS fell from 99.95 KB to 99.35 KB after narrowing Tailwind scanning. Future passes should measure from the current assets and avoid stacking lossy conversions for small gains.

## Asset folder layout

`public/shared` holds shared bathroom and character artwork; `public/bath`, `public/brush`, and `public/bedtime` hold game-specific static artwork. `public/cursors` holds pointer graphics, and `public/fonts` holds the full Schoolbell WOFF2 font and its license. Imported home previews live in `assets/home`; imported wardrobe artwork and the quilt live in `assets/bedtime`. Its generated `previews` subfolder contains small picker and category images, which prevent downloading full-size wardrobe art merely to browse. Skill fitting references remain inside the skill.

`dist` is generated deployment output and intentionally contains copies of public files plus hashed imported assets. It is ignored by Git and rebuilt by Vite. These are expected build copies, not redundant source files. Remove replaced source artwork automatically after all consumers are migrated and other states checked. Keep candidates, reviews, and backups outside shipped folders. The latest compression pass already retained only candidates that reduced bytes while preserving dimensions, alpha and pencil quality; avoid repeated lossy compression for marginal savings.

## Why these retained assets exist

| Location | Purpose |
| --- | --- |
| `assets/home` | Three small generated scene previews, 27,956 bytes combined. They avoid downloading full-resolution game artwork on home. These are intentional size variants, not obsolete backups. |
| `public/brush/step-toothbrush.webp` | The 2,662-byte front-facing toothbrush icon beside the brushing step label. |
| `public/brush/tongue-source.webp` | The tongue round clips its tongue texture from this mouth image in `src/tongue-mouth.tsx`. The outside-tooth artwork serves a different state. |
| `skills/bedtime-outfits/assets/bedtime-layout.png` | Three-column, two-row garment placement guide supplied to ImageGen. |
| `skills/bedtime-outfits/assets/bedtime-hood-layout.png` | Matching generation guide including an open-face hood. |

Skill reference images support future asset creation and are excluded from the site build. The empty `assets/bath-review` directory was removed. Keep review drafts outside shipped artwork folders. Check actual consumers and game states before declaring an image unused; different tool poses, tongue source art, and small previews can be intentional. Prefer sharing the same source when both purpose and resolution match. Retain a dedicated compressed preview when it materially reduces first-page downloads.


The wardrobe currently has thirteen sets, including Panda Cuddles, Honey Bear, Woodland Fox and Polar Skate. The fox and skiing-bear looks have tops, pants and socks only. Animal wrist cuffs taper toward the hands and the sock shafts tuck beneath pant cuffs. Removed outfit source assets must not remain in the shipped folder or current design catalog.

The current outfit progress and reusable repair prompts are consolidated in `skills/bedtime-outfits/references/outfit-prompts.md`; the current bounds snapshot is in `references/art-style.md` alongside it. Woodland Fox and Polar Skate tops are slightly lowered with narrow crew-neck openings and roomier sleeves; Honey Bear pants are slimmer. Preserve current positioning during future targeted repairs and replace outdated notes in place.

## Removing individual Bedtime pieces

The Dress Up document uses the original warm cream (#faf7f0) page background, dark lettering and brown keyboard focus outlines. The nighttime blue remains in the existing transition/loading overlay. Keep the white-and-brown picker and Wearing strip, and preserve the illustrated bedroom. The picker header has a white (#ffffff) background and dark brown (#4B2E2B) text so category labels and the fixed Cherry Checks artwork stand out.

A Wearing strip vertically centered at the right edge of the bedroom lists equipped pieces with their existing artwork and a remove mark. Only the 28-pixel X button takes off a piece, including pieces chosen through a set; clicking the preview or its tile does nothing. Tile hover and focus gently scale the preview and warm its background; reduced-motion settings skip the scaling. The X has its own brown hover and keyboard-focus feedback. It follows set swaps and mixed outfits, disappears when empty, and supports keyboard focus moving to the next piece or back to the picker. Removing a piece after completion returns to editing. Ready for bed requires a top and pants. The Wearing frame, tiles and X buttons use the same white surfaces, brown borders and soft gray scrollbar track as the picker. The Wearing tiles are 72 pixels on mobile and 80 pixels on wider screens, 2-pixel brown dashed outlines and a 3-pixel brown outer frame; the strip scrolls when the scene is too short. Keep the toolbar outside the scene's role=img so assistive technology can discover its buttons.

The outfit picker uses a single three-column grid with white surfaces, existing pencil artwork and names below the previews. Use white (#ffffff) for the picker panel, header and tiles; retain #f0e3cf hover/selection and #79563f frames/dashed borders, with #564736 text. Selected tiles use the warm background only; do not add an inset box or selection shadow. Preserve keyboard focus outlines. Thumbnail areas inherit the tile surface instead of adding another background. Each tile keeps the rounded corners and 2-pixel dashed outline used by the Wearing tiles; avoid extra row frames or an inner frame around the grid. Rows retain their natural preview height so the picker scrolls instead of squeezing its tiles. Keep a stable scrollbar gutter with a soft neutral #e7e5e4 rail and dark brown (#603b24) thumb so the scroll track is distinct from the panel. The Ready for bed button uses deep brown (#603b24) with a white hover background. Selection tiles contain no X controls; remove marks belong only to the Wearing strip. Preserve category selection, pressed states, keyboard focus and individual item removal when changing the layout.

The Shuffle outfits button beside Ready for bed independently randomizes the required top, pants and socks. Headwear and a sleep mask are each optional (independent 50% inclusion), including standalone accessories. Every chosen piece differs from the currently worn piece; top and pants must come from different outfits to guarantee a mixed combination. It returns the picker to Sets, clears completion, resets picker scrolling and updates the Wearing strip. Individual X controls still work afterward. Announce the selected set or mixed pieces through the existing live status; hide shuffle while showing the completed bedtime state. All six category icons use fixed Cherry Checks artwork and must never follow the worn outfit or shuffle result. Icon circles are 40 pixels on mobile and 48 pixels on wider screens. They stay white, including selection and hover, with brown dashed borders. The selected category uses a thicker dashed circle and an underlined label. The header divider is a 2-pixel brown dashed line.

## November 24, 2026 optimization and release

The font changed losslessly from the 48,904-byte TTF to a 22,772-byte WOFF2 with all 228 glyphs and character mappings retained. All four HTML font preloads and the shared CSS use WOFF2; the superseded TTF was removed and its license retained. Nine obsolete landing-page/unused utility definitions were removed, reducing production CSS from 103,444 to 100,103 bytes and JavaScript from 357,703 to 355,486 bytes. Total built output fell from 4,154,039 to 4,122,361 bytes. Two skill placement guides lost another 356 bytes through lossless PNG optimization.

The asset audit found no exact duplicate images and no unused runtime artwork. Compression trials that changed alpha, exceeded the pencil-quality limit, or offered only marginal savings were rejected. Preserve the current optimized artwork and approved lossless mouth crop. Python caches are ignored, and the Vercel upload excludes development dependencies, generated dist, tests and skill/documentation files; GitHub retains the reusable skills and source documentation.

## On-demand loading

Wardrobe previews are generated from the approved artwork and registered bounds by scripts/generate-wardrobe-previews.mjs, using development-only Sharp. Run npm run generate:wardrobe-previews after art, part or fit changes. The generated src/wardrobe-previews.ts imports 77 small images from assets/bedtime/previews; category images use the fixed Cherry Checks reference. The generator deletes obsolete preview files. Preserve the full originals and licenses: worn layers use those originals, while the picker uses smaller display variants. Vite keeps image URLs outside the JavaScript bundle with assetsInlineLimit set to zero.

Bedtime entry loads the room, character, bandages, category icons and first row of previews. An IntersectionObserver loads other previews as they approach the picker viewport. Selecting an outfit or shuffling decodes only the selected pieces before applying them; a failed request leaves the current outfit intact and can be retried. Removing a piece cancels a pending selection. The shared image cache avoids repeating decodes for already loaded pieces.

Brush Up entry loads either the bathroom intro/finish or the saved brushing round. The game waits for the requested next scene before changing state, including the tongue and finish scenes, with a retry message if it fails. Brushing and bedtime transitions prepare their artwork on pointer/focus intent or click rather than loading future scenes during initial entry. Saved progress and reduced-motion behavior remain compatible.

Controlled cold-load measurements used the production build in Edge at 1440 by 960, 100 ms latency, 196,608 bytes/second download bandwidth, reduced motion and disabled cache. Bedtime became usable in 3.78 seconds instead of 12.97, with 651,878 bytes transferred instead of 2,414,522 before play. Brush Up became usable in 3.87 seconds instead of 8.88, with 618,998 bytes instead of 1,644,038. These are controlled comparisons, not guarantees for every connection. All four routes, actual saved-round entry, normal/reduced transitions, optional shuffle accessories, keyboard/removal and deferred-image failure/retry passed at desktop and phone widths.

vercel.json applies public, max-age=31536000, immutable only to Vite content-hashed /assets/ URLs, following https://vercel.com/docs/caching/cache-control-headers. HTML and mutable public paths retain revalidation. Verify the header on production after deployment. The Vercel upload excludes the generator and its development tooling.
