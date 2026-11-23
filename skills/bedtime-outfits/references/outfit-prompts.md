# Outfit generation prompts

## Reusable pajama prompt

Replace the bracketed parts with the requested outfit and supplied references.

```text
Create or repair [outfit name] for the Bedtime dress-up game in When Sunday Comes Around.

Use [clothing reference] for fabric, colors, collar, trim, and motifs. Use the existing character sprite for the softly shaded colored-pencil style, fine charcoal contours, muted colors, and paper grain. Use the supplied fitting guide for the actual hanging-arm pose.

Preserve approved pieces and their placement. Change [requested pieces or defects]. Add only the requested accessories. When socks are absent from a new outfit reference, make a matching pair.

For a new set, use a transparent three-column, two-row sheet. Put top, pants, and optional headwear across the first row. Put an optional sleep mask in the lower-left cell and socks in the lower-middle cell. Leave unused cells transparent. For a repair, isolate the affected piece so other approved pieces stay intact.

Make the top look worn on this character. Keep the collar close to the lower neck, with transparent space inside its opening and no extra band across the skin. Cover both shoulders. Fit sleeve width to the arms with a modest cloth allowance. Finish cuffs at the wrists, above the hands. Keep the torso and sleeves continuous, with smooth seams and straight fabric checks.

Balance the pant legs and cuff heights. Match socks to the feet and tuck their shafts beneath the pants. Keep hoods rounded with transparent face openings. Keep sleep masks naturally wide and low with readable small motifs.

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

Accessory references may be independent mix-and-match pieces. Register accessory-only choices separately from pajama sets. Match the requested shape, preserve open hood faces, and fit the accessory at its natural aspect ratio. The accessory collection includes Starry Night, Midnight, Bunny Dreams, Pink Cat, and Blue Cat.
