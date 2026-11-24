# Outfit generation prompts

## Reusable pajama prompt

Replace the bracketed parts with the requested outfit and supplied references.

```text
Create or repair [outfit name] for the Bedtime dress-up game in When Sunday Comes Around.

First read references/art-style.md and supply its approved local style anchors. Use [clothing reference] for fabric, colors, collar, trim, and motifs. Use the existing character sprite for the softly shaded colored-pencil style, fine charcoal contours, muted colors, and paper grain. Use the supplied fitting guide for the actual hanging-arm pose.

Preserve approved pieces and their placement. Change [requested pieces or defects]. Add only the requested accessories. When socks are absent from a new outfit reference, make a matching pair.

For a new set, use a transparent three-column, two-row sheet. Put top, pants, and optional headwear across the first row. Put an optional sleep mask in the lower-left cell and socks in the lower-middle cell. Leave unused cells transparent. For a repair, isolate the affected piece so other approved pieces stay intact.

Make the top look worn on this character. Keep the collar close to the lower neck, with transparent space inside its opening and no extra band across the skin. Cover both shoulders. Fit sleeves around the unchanged original arms with a modest cloth allowance. Never hide or cut the arms to compensate for thin clothing. Add sleeve fabric toward the inner forearms when coverage is insufficient, while retaining cuff centers. Finish cuffs at the wrists, above the hands. Keep the torso and sleeves continuous, with smooth seams and straight fabric checks.

Balance the pant legs and cuff heights. Match socks to the feet and tuck their shafts beneath the pants. Keep hoods rounded with transparent face openings. Match new ordinary sleep masks to Cherry Checks: the same 275 x 99 worn bounds, a mirror-balanced silhouette, equal straps and lobes, and a centered nose notch. Fit Bunny Dreams at its current smaller bounds from art-style.md, allowing room for its ears. Keep small motifs readable.

Use clean antialiased transparency around every piece. Remove paper borders, background residue, halos, and stray colored pixels. Include no character, labels, guide marks, or background in the final artwork.

After generation, pack the artwork into the existing atlas layout and register it in src/bedtime-outfits.tsx. Keep detailed masks separate if packing loses their proportions or detail. Import project artwork through Vite so revised images get new URLs.

Render the worn pieces in the game before accepting the result. Inspect neck, shoulders, forearms, wrists, waist, ankles, and sock joins at desktop and narrow widths. Compare the compressed image with the source. Keep the smallest format that preserves the pencil texture and contours. Update consumers and remove superseded files in the same change.
```

## Sheet layout

Use one transparent three-column, two-row sheet per outfit. Use the user's reference for garment design, the plain or hood layout guide for cell positions, and the project's character sprite for colored-pencil rendering.

Put the top, pants, and any reference headwear across the first row. Put any reference sleep mask in the lower-left cell and the socks in the lower-middle cell. Leave unneeded cells transparent. If the reference has no socks, design one matching pair. Keep items isolated, front-facing, and separated by transparent space. Keep outlines naturally drawn, fabric checks and seams straight across the front, and a visibly rounded, shaded fit for any reference hood. The face opening must be transparent. Do not include a person, background, letters, props, or a watermark.

Fit the actual character pose. Use continuous sloping shoulders and sleeves that follow the hanging arms, with cuffs covering the wrists and a modest fabric allowance. Make both sleeves proportionate to the thin arms. The collar should surround the lower neck with a transparent opening and flow continuously into the shoulders. Keep rear collar fabric and extra neckline strokes out of the opening. Preserve the drawing's pencil edge with clean antialiased transparency and no paper fringe. Keep checks and seams continuous through the shoulders and forearms.

## Current outfit details

- **Little Dinosaur** uses a moss-green top with a cream belly panel, green pants with soft cream spikes, a rounded open-face dinosaur hood, and the reference's cream-tipped paw design for socks.
- **Cloud Blue** uses matte slate-blue button-front pajamas with a notched collar and chest pocket. Add blue socks with light cuffs.
- **Sleepy Cat** uses a blue-gray top with a cream front and cat pocket, matching pants, a rounded open-face cat hood, and the reference's cream cat-paw design for socks.
- **Cherry Checks** uses powder-blue gingham, cream ruffles, and the pale yellow cherry pocket motif. Add matching checked socks.
- **Mushroom Checks** uses sage gingham, moss scalloped trim, and the red mushroom pocket motif. Add matching checked socks.
- **Moonlight Plaid** uses a gray torso, charcoal raglan sleeves with thin cream checks, a black round collar, checked pants, and cream-cuffed checked socks.
- **Cozy Fair Isle** uses oatmeal, brown, and pale blue geometric knit bands, a brown button placket, a low standing collar, matching pants, and socks.
- **Yarn Cat** uses warm oatmeal fabric, an ochre polo collar, a brown cat playing with red yarn, drawstring pants, and matching socks. Its sleep mask has an ochre edge, a sleeping brown cat, and red yarn. The polo opening is transparent between the two lapels.
- **Cocoa Puppy** uses cocoa fleece, a white puppy chest motif, cream collar and cuffs, gathered pants, and matching socks. Its cocoa sleep mask has cream trim and a white sleeping puppy. Keep the top's round neck opening clear and shoulders fully covered.

- **Panda Cuddles** uses an ivory zip top, charcoal sleeves, ear-tab pockets, ivory pants and socks, and an open-face panda hood.
- **Honey Bear** uses a chestnut zip top with one patch pocket, matching pants and socks, and an open-face bear hood with cream muzzle.
- **Woodland Fox** uses a charcoal crew-neck top with gray-and-cream fox, black-and-ivory buffalo-check pants and charcoal socks.
- **Polar Skate** uses a charcoal crew-neck top with a skiing white polar bear, red-and-charcoal buffalo-check pants and dark red socks.

Accessory references may be independent mix-and-match pieces. Register accessory-only choices separately from pajama sets. Match the requested shape, preserve open hood faces, and fit the accessory at its natural aspect ratio. The accessory collection includes Starry Night, Midnight, Bunny Dreams, Blue Cat, Gray Cat, Dreamy Puppy, and Buttercup Puppy.

## Reusable accessory repair prompt

Replace bracketed fields and attach the actual images in this order.

```text
Edit [accessory] for When Sunday Comes Around's Bedtime game.
Image 1 is the current accessory: preserve [approved design, palette, motifs and silhouette]. Image 2 is public/shared/bath-sprite.webp: strictly match its traditional colored-pencil rendering. Image 3 is [approved garment or hood]: use it for [specific style or fitting role]. The game screenshot shows [actual defect] on the worn character.

Change only [requested defect]. Preserve approved placement and size unless this request changes them. Use visible fine crosshatching in varied directions, softly layered muted pigment, paper tooth and delicate broken graphite contours. Keep facial motifs readable at the actual worn size. Avoid smooth vector fills, heavy sticker borders, coarse uniform scratches, glossy plush and photorealistic rendering.

Fit the hat's band around the crown and temples with a gentle curve and subtle fabric folds. Keep bangs visible below it. Fit open hoods around the face with a genuinely transparent opening. For Bunny Dreams use Buttercup Puppy's width, height and face-opening placement as the explicit fit reference.

For ordinary masks, match Cherry Checks' broad low silhouette, equal side straps and lobes, and centered nose notch. Keep artwork proportions intact. Render only the complete isolated accessory with clean antialiased transparency, no background, cast shadow, halo, paper fringe, text or character.
```

## Current progress — November 24, 2026

The wardrobe has 13 sets listed above. Keep approved designs and placement while changing only the requested feature. Sleepy Cat is the fit reference for comfortable sleeves, wrist cuffs and smooth pant-to-sock joins. Exact current bounds are consolidated in [art-style.md](art-style.md#current-fitting-snapshot); src/bedtime-outfits.tsx remains authoritative for runtime values.

- Woodland Fox and Polar Skate have narrower, shallower transparent crew-neck openings. Their tops were lowered slightly to expose more lower neck, keeping cuffs and hems at the same height. Preserve their roomier sleeves and current placement.
- Honey Bear has roomier sleeves and slightly slimmer pants with unchanged length. Preserve its smooth low pant cuff over the sock shaft.
- Panda Cuddles has fuller sleeves and rounded gathered pant hems meeting its socks smoothly. Keep its hood and approved design.
- Yarn Cat and Cocoa Puppy tops were lowered to retain visible lower-neck space. Preserve their cuff registration.
- Gray Cat uses a low rounded crown and curved fitted cream band. Blue Cat has a fitted curved brim, visible bangs and a slightly raised position. Hat fit follows the forehead band, not the entire image bounds.
- Bunny Dreams hood matches Buttercup Puppy's width, height and broad face opening. Its smaller bunny mask remains a separate accessory. Ordinary masks match Cherry Checks' size and balanced silhouette.

Independent choices are Gray Cat hat, Dreamy Puppy mask, Buttercup Puppy hood, Starry Night mask and cap, Midnight mask, Bunny Dreams mask and hood, and Blue Cat hat. Hats and hoods share one category. Pink Cat mask and the complete Teddy Snug set were removed; do not restore them unless requested. Fox and polar sets have no wearable hat or mask. Onesie-inspired panda/bear sets remain four mixable pieces with matching fabric and zipper alignment.

## Targeted top-repair prompt

```text
Repair only [specific feature] on [top]. Use the current top for design and pencil texture, public/shared/bath-sprite.webp for unchanged anatomy, and Sleepy Cat for sleeve and cuff fit. Preserve the latest registered placement, roomier sleeve contours, torso motif, shoulders, cuff centers, hem height and other approved features.

Keep visible lower-neck space. A crew collar has a narrow, shallow, genuinely transparent opening with a single thin front rim. No rear fabric strip, second neckline or gray patch across the skin. Change collar shape in the artwork instead of moving an already approved top.

Fit sleeves around the original arms. Add a little fabric toward the inner forearms if skin peeks through. Do not shift the cuffs outward, lengthen them onto the hands, or hide the character's arms. Preserve the website's fine colored-pencil crosshatching, muted pigment and broken graphite edges.

Output only the repaired top, complete and isolated on clean antialiased transparency. No character, background, cast shadow, halo, paper fringe or other clothing.
```

## Delivery and maintenance

Use built-in ImageGen for raster drawing changes. Supply actual style anchors with explicit roles. Keep generation guides in the skill's assets folder; they are not runtime artwork. Full sets use the atlas layout; isolated repairs preserve approved pieces and their registration. Save compressed selected artwork in assets/bedtime and update consumers together. Remove the superseded source asset after checking source references, preloads, CSS/SVG URLs, dynamic paths and other game states. Keep shared assets and licenses. Keep candidates and QA scratch files outside shipped folders. Avoid repeated lossy recompression.

Inspect the worn result at desktop and mobile widths, including mixed pieces and accessory removal. Check neck, shoulders, both inner/outer arm edges, wrists, waist, ankles and sock joins. Build after runtime or asset changes. Update current decisions in place rather than appending conflicting historic bounds. Publishing remains a separate user-requested step; current outfit refinements are local and have not been published.
