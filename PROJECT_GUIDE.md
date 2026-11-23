# When Sunday Comes Around

This project teaches everyday self-care through short, interactive games for kids. The visual baseline is a colored-pencil illustration style with paper textures, muted colors, and handwritten type. Keep on-screen instructions short and show the next action where the child needs it.

## Run the project

- Run `npm ci` to install the locked dependencies.
- Run `npm run dev` to start Vite.
- Run `npm run build` for the TypeScript check and production build.

React and TypeScript power the interactions. Vite builds four HTML entry points. Use Tailwind utilities in TSX for styling. Shared utility sets and selector variants live in `src/ui-classes.ts`. The single Tailwind entry, `src/index.css`, registers the Schoolbell font and custom animation keyframes.

| Route | Main source | Current role |
| --- | --- | --- |
| `/` | `src/main.tsx` | Three illustrated game cards with short, child-friendly labels |
| `/wash-up/` | `src/wash-up.tsx` | Nine guided bath steps, followed by a link to brushing |
| `/brush-teeth/` | `src/brush-teeth.tsx` | Bath-to-brushing intro and five guided brushing steps |
| `/dress-up/` | `src/dress-up.tsx` | Bedtime outfit choices and live bedroom preview |

## Current game design

**Wash Up** walks through picking out leaves, wetting hair, shampooing, rinsing hair and wetting the body, soaping, scrubbing, rinsing, drying, and bandaging. The finished scene shows a clean character with sparkles and offers a link to Brush Up.

**Brush Up** opens with the clean, full-body character and the “Bath done! Brush time!” speech bubble. The intro button plays the full-screen toothpaste transition. Applying toothpaste during the game uses a separate animation inside the sink scene. The child adds toothpaste, brushes the outside of the top teeth, brushes the outside of the bottom teeth, brushes the tongue, and spits into the sink. A sparkle marks each completed row. Before the tongue step, a short tip reminds kids to brush the insides and chewing surfaces at home. Checkpoints from the former inside and chewing rounds resume at the tongue. The three counter items support pointer interaction and keyboard selection. Finish returns to the shared clean bathroom scene, where “Choose pajamas” sweeps a colored-pencil night quilt over the page and opens Bedtime and “Play again” restarts brushing.

**Bedtime** reuses the smiling character and bandages from `src/bath-scene.tsx` with `public/pajama-bedroom.webp` behind them. On wide screens the 4:3 bedroom scene sits to the left of the picker. The title and action align with the top and bottom of the scene, and the garment grid scrolls inside the picker. At narrower widths the scene stacks above the picker. Kids can select a whole outfit or mix its pieces. The picker only shows accessories available in a set. Outfit selections last for the current visit. The Bedtime loading screen continues the illustrated quilt handoff and lifts away when the room is ready. The click transition is portaled directly to the document body so it stays outside the finish message box. Reduced-motion navigation opens the room directly.

The nine illustrated sets are in `assets/bedtime/`. `src/bedtime-outfits.tsx` registers their atlas positions for garment-only tiles and worn layers. Vite includes the content hash in each production atlas URL so revised artwork loads with the matching picker. The Cherry Checks and Mushroom Checks sets have nightcaps and separate high-resolution sleep masks. Moonlight Plaid, Cozy Fair Isle, Yarn Cat, and Cocoa Puppy each include a top, pants, and matching socks. Yarn Cat and Cocoa Puppy also have matching sleep masks. Nightcaps and hoods share the Hats & hoods category. Use the [Bedtime outfits skill](skills/bedtime-outfits/SKILL.md) to turn future references into fitted layers. Its packing script, registration guides, and ImageGen prompts accompany it.

<details>
<summary>Bedroom illustration prompt</summary>

The built-in ImageGen tool softened the haze on the previous bedroom illustration. The artwork fills its frame edge to edge. The cream border is 3 px on phones and 5 px on wider screens, styled in `src/ui-classes.ts`.

> Make a minimal tonal adjustment to this exact 4:3 colored-pencil bedroom background for a children's game. The user likes the soft foggy blue atmosphere and wants it just a little less foggy. Reduce the pale bluish veil by only about one fifth, introducing a small increase in local definition in the bed folds, chair, and floor while keeping the same gentle palette, soft shadows, pencil grain and medium-light blue nighttime atmosphere. Keep the overall exposure nearly the same, and leave a noticeable amount of the original dreamy haze throughout. Preserve the identical composition and geometry, all furniture and props, crop, small faint crescent by the window’s right edge and soft moonlight where they are. This should read as the same illustration at a slightly clearer setting. No added objects, sharper outlines, heavy contrast, larger moon, brighter light effects, border, characters, text, extra stars or interface. Full-bleed landscape illustration.

</details>

The approved Brush Up front view uses `public/brush-pencil-slim-laterals.webp`. It has a closed bite, pencil-textured pink gums, 14 teeth per row, and slimmer upper lateral incisors beside the large center pair. The tongue round uses `public/brush-smile.webp`. `src/tooth-coating.tsx` draws the removable tint and food stains. The brush, toothpaste, glass, and organizer are separate assets.

Each outside brushing round uses three areas per row: five teeth on the left, four in front, and five on the right. Each tooth earns its own progress, and a guide moves on only after every tooth in the current area is brushed. `src/brush-sections.ts` shares tooth positions across hit detection and artwork and carries saved area progress forward. The tongue still has one guide.

The games use `src/activity-loading.tsx` after React loads. Each route preloads and decodes the artwork used across its steps, including CSS backgrounds, sprites, and cursors. The opening or saved scene mounts behind the loader, which stays visible until the mounted images and Schoolbell font are ready and the scene has had a frame to render. Add any new stage assets to the route’s preload list. The initial loading screens use Tailwind classes in their HTML entry points and link the same Tailwind entry in the document head. Shared sparkle illustrations live in `src/character-shine.tsx`.

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
