# When Sunday Comes Around

This project teaches everyday self-care through short, interactive games for kids. The visual baseline is a colored-pencil illustration style with paper textures, muted colors, and handwritten type. Keep on-screen instructions short and show the next action where the child needs it.

## Run the project

- Run `npm ci` to install the locked dependencies.
- Run `npm run dev` to start Vite.
- Run `npm run build` for the TypeScript check and production build.

React and TypeScript power the interactions. Vite builds three HTML entry points. Use Tailwind utilities in TSX for styling. Shared utility sets and selector variants live in `src/ui-classes.ts`. The single Tailwind entry, `src/index.css`, registers the Schoolbell font and custom animation keyframes.

| Route | Main source | Current role |
| --- | --- | --- |
| `/` | `src/main.tsx` | Entry point with links to both games |
| `/wash-up/` | `src/wash-up.tsx` | Nine guided bath steps, followed by a link to brushing |
| `/brush-teeth/` | `src/brush-teeth.tsx` | Bath-to-brushing intro and five guided brushing steps |

## Current game design

**Wash Up** walks through picking out leaves, wetting hair, shampooing, rinsing hair and wetting the body, soaping, scrubbing, rinsing, drying, and bandaging. The finished scene shows a clean character with sparkles and offers a link to Brush Up.

**Brush Up** opens with the clean, full-body character and the “Bath done! Brush time!” speech bubble. The intro button plays the full-screen toothpaste transition. Applying toothpaste during the game uses a separate animation inside the sink scene. The child adds toothpaste, brushes the outside of the top teeth, brushes the outside of the bottom teeth, brushes the tongue, and spits into the sink. A sparkle marks each completed row. Before the tongue step, a short tip reminds kids to brush the insides and chewing surfaces at home. Checkpoints from the former inside and chewing rounds resume at the tongue. The three counter items support pointer interaction and keyboard selection. Finish returns to the shared clean bathroom scene with a smiling character and a Play again button.

The approved Brush Up front view uses `public/brush-pencil-slim-laterals.webp`. It has a closed bite, pencil-textured pink gums, 14 teeth per row, and slimmer upper lateral incisors beside the large center pair. The tongue round uses `public/brush-smile.webp`. `src/tooth-coating.tsx` draws the removable tint and food stains. The brush, toothpaste, glass, and organizer are separate assets.

Both games use `src/activity-loading.tsx` after React loads. The initial loading screens use Tailwind classes in their HTML entry points and link the same Tailwind entry in the document head. Shared sparkle illustrations live in `src/character-shine.tsx`.

## Guidelines for the next editor

- Read the relevant route and check the current artwork in the game before editing. Keep approved artwork and flows in scope when applying a targeted change.
- If the mouth framing or tooth placement changes, check the brush target circles in `src/brush-teeth.tsx` and the tint regions, stain coordinates, and enamel mask in `src/tooth-coating.tsx` together. Check a partially brushed row as well as a fresh one.
- Keep pointer, touch, keyboard, and reduced-motion behavior working. Check the intro transition and the in-scene toothpaste animation independently when touching either one.
- Progress is saved locally. Wash Up uses `when-sunday-comes-around.wash-up.v1` and Brush Up uses `when-sunday.brush-teeth.v2`. Brush Up's saved step IDs differ from the displayed sequence. Preserve compatibility with existing saves when changing steps or target counts.
- Before removing a public asset, check references in HTML preloads, CSS URLs, SVG references, image-loading lists, and dynamically constructed classes or paths. Keep the Schoolbell license with its font.
- Keep complete Tailwind utility names as literals so the build can detect them. Semantic class names also support state selectors and interaction hooks, so check their uses before renaming them.
- After changes, run the build and open the affected route. For visual changes, check at desktop and narrow widths. For interaction changes, check the normal entry point, progress, and Start over.
- Update this guide when the user asks. Record approved behavior, asset locations, and decisions a future editor needs.
