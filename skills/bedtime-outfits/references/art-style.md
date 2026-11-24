# Approved Bedtime art style and fit

Apply this guide to every new pajama, hood, hat, sleep mask, sock, and repair. Keep the existing website's traditional colored-pencil illustration consistent across all pieces.

## Required visual references

- `public/shared/bath-sprite.webp` defines line weight, irregular charcoal contours, layered pencil strokes, paper grain, and muted pigment.
- `assets/bedtime/cherry-gingham-mask.avif` defines the approved sleep-mask rendering and ordinary mask proportions. Convert a copy to PNG for tools that cannot inspect AVIF.
- `assets/bedtime/cherry-gingham.webp` and `assets/bedtime/mushroom-gingham.webp` define the approved garment finish. Crop a reference piece when needed.
- The user's clothing photos define design and motifs. The project's approved artwork defines the rendering medium.

Supply the actual style images with every generation. Ask for visible short pencil strokes, softly layered pigment, restrained shading, and delicate imperfect charcoal contours. Keep paper texture within the garment's alpha silhouette. Avoid glossy satin, photorealistic plush, smooth vector fills, airbrushing, uniform digital outlines, white paper fringes, and background residue. Inspect the compressed result at its actual worn size.

## Accessory registration

Ordinary masks share Cherry Checks' worn bounds `[312, 196, 275, 99]` in the 900 × 1350 character view. Generate the complete mask including straps close to the same 2.78:1 ratio. Keep left and right lobes equally sized, straps level and equal, the nose notch centered, and seams smooth. Motifs may vary while the silhouette remains balanced. Bunny Dreams uses smaller `[326, 120, 248, 180]` mask bounds to accommodate its ears without overwhelming the face. Its hood matches Buttercup Puppy at `[215, 0, 470, 500]` bounds, including the wide face opening.

Fit hats by their forehead band, then allow for ears and dangling tails. Center the band on x=450, cover the crown, and keep the brim near the upper forehead. A long tail may extend beside the head. Check the actual band position rather than centering the entire tail-inclusive image on the head. Use a softly curved forehead band and smooth flowing fabric contours. Keep the Starry Night crown low, with its crown-to-band height around half the band width. Conceal crown hair covered by a hat so tufts cannot poke through it. Favor delicate varied pencil hatching over coarse uniform diagonal scratches. Preserve transparent face openings.

Blue Cat uses `[283, 16, 334, 220]` worn bounds and a crown hair cover of 105. Its brim should hug the upper forehead with bangs visible underneath. Keep its width close to the head and its lower band near the temples so it reads as worn.

## Collar and cuff checks

Keep a visible lower neck between chin and collar. Polo lapels meet near its base with a clear transparent opening. Round collars surround the lower neck. Keep collar fabric below the chin and preserve both shoulder contours. When lowering a top, preserve wrist registration by keeping its lower edge fixed where practical. Check the full worn character, since an isolated asset cannot establish a correct fit.

## Reusable style instruction

> Match the supplied approved game artwork strictly: traditional colored pencil, visible irregular hatching, softly layered muted pigment, subtle paper grain, and fine charcoal contours. Use the design reference only for shape, colors, and motifs. Keep the approved character pose and fit. Render the isolated piece with clean antialiased transparency. Compare its pencil texture, edge weight, and proportions against the supplied approved artwork before shipping.

## Current fitting snapshot

Current as of November 24, 2026. Bounds are `[x, y, width, height]` in the 900 × 1350 character view. Read src/bedtime-outfits.tsx before editing; update this table when the user's preference changes.

| Piece | Current bounds | Preserve |
| --- | --- | --- |
| Woodland Fox top | `[290, 370, 320, 360]` | Slightly lowered collar, narrow shallow opening, roomier sleeves; cuffs/hem end at y=730 |
| Polar Skate top | `[290, 370, 320, 360]` | Same fitting rules as Woodland Fox |
| Honey Bear top | `[290, 362, 320, 368]` | Current zip neckline, roomy sleeves and cuff placement |
| Honey Bear pants | `[329, 651, 242, 603]` | Slightly slimmer legs, unchanged length and low gathered hems |
| Panda Cuddles top | `[278, 362, 344, 388]` | Fuller sleeves, cuffs above hands, current hood join |
| Panda Cuddles pants | `[321, 651, 258, 603]` | Rounded gathered legs and one low cuff |
| Panda / Honey Bear socks | `[320, 1184, 260, 154]` | Shafts tucked beneath pant hems |
| Yarn Cat top | `[289, 360, 322, 374]` | Lowered collar with visible neck, cuff registration |
| Cocoa Puppy top | `[289, 362, 322, 372]` | Lowered collar with visible neck, cuff registration |
| Gray Cat hat | `[283, 12, 334, 240]` | Low rounded crown and curved cream forehead band |
| Blue Cat hat | `[283, 16, 334, 220]` | Curved fitted brim, visible bangs, hair cover 105 |
| Bunny Dreams / Buttercup Puppy hoods | `[215, 0, 470, 500]` | Matching overall size, width and broad transparent face opening |
| Bunny Dreams mask | `[326, 120, 248, 180]` | Smaller mask with balanced ears |
| Ordinary sleep masks | `[312, 196, 275, 99]` | Cherry Checks proportions and symmetry |

Sleepy Cat is the approved sleeve-width, wrist and ankle-join reference. Woodland Fox, Polar Skate, Panda Cuddles and Honey Bear keep the original arms intact and must not enable coversArms. If a sleeve exposes skin, add cloth allowance to its inner contour while retaining cuff centers. Widening the entire image can shift the sleeves outward and expose inner arms. Cuffs stop above hands. Use one low rounded pant cuff over the sock shaft, with no stacked ribbed rings, gaps or sharp ledges.

Fox and polar crew collars have a single thin front rim and a narrow, shallow transparent opening. Keep rear fabric strips, extra horizontal neckline strokes and gray patches out of the opening. Their latest lowering is intentional: preserve visible lower-neck skin and current placement.

The 13 current sets are recorded in outfit-prompts.md. Pink Cat mask and Teddy Snug are removed. The source folder assets/bedtime contains shipped wardrobe art; generation layouts remain under this skill's assets folder. Update this snapshot in place, removing superseded values rather than keeping conflicting append-only notes.
