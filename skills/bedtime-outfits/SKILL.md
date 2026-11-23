---
name: bedtime-outfits
description: Turn supplied clothing references into colored-pencil outfit sets for the Bedtime game in When Sunday Comes Around. Use when adding, fitting, or replacing pajamas, nightcaps, hoods, sleep masks, and socks for the existing character.
---

# Bedtime outfits

Read the project's `AGENTS.md` and the Bedtime section of `PROJECT_GUIDE.md`. Design references describe the clothes. Any game screenshots in the request explain the interface or existing state.

Use the [reusable pajama prompt](references/outfit-prompts.md#reusable-pajama-prompt) for new looks and repairs. It carries the game's visual context, atlas layout, fitting rules, and delivery checks. Replace its bracketed fields with the current request.

1. Identify the parts of each look. Use the reference for fabric, collar, trim, and motifs. Include headwear and sleep masks only when shown or specifically requested. If socks are missing, design a matching pair. Preserve existing matching pieces when refitting a set.
2. Use built-in ImageGen per new look. Supply the clothing reference, `assets/bedtime-layout.png` or `assets/bedtime-hood-layout.png`, and the project's `public/bath-sprite.webp` for pencil texture. Ask for a transparent 3-column, 2-row sheet. Put top, pants, and optional headwear across the top row. Put an optional sleep mask and the socks in the first two bottom cells. Leave unused cells transparent. Keep hoods rounded with visible fabric shading and an open transparent face. See [outfit prompts](references/outfit-prompts.md).
3. Inspect the sheet and pack it with Pillow using `scripts/pack_outfit.py INPUT.png assets/bedtime/LOOK.webp`. The default packs top, pants, and socks. Use `--parts top pants socks headwear --hood` for an open-face hood, or list the exact pieces in `--parts` for other looks. The 768 × 640 WebP keeps 256 × 320 cells. Every piece keeps its drawn silhouette. Place socks as a whole and overlap their shafts under pant cuffs. Preserve seams and fabric patterns by adjusting whole-piece placement in `src/bedtime-outfits.tsx`. Keep each shipped top continuous. When a sleeve needs reshaping, correct the artwork or bake the verified fit into its atlas cell so the collar and shoulders render together.
4. Add the look to `bedtimeOutfits` with the same part list and, for an open hood, a matching `hoodLining` color. The picker hides categories with no applicable pieces. Keep thumbnails garment-only. The live preview layers pieces on the original character and conceals only the sprite and bandages covered by clothing.
5. Build and inspect each piece and the full set. Check the neck opening, shoulder coverage, wrist coverage, sleeve proportions, straight fabric checks, waist, ankles, and hood opening. Inspect the compressed result against both the bedroom and a contrasting background for paper fringes and broken contours. Keep detailed masks as separate images at their natural aspect ratio when atlas packing loses stitching or motifs. Compare the replacement's byte size and appearance, using the original generation for packing instead of repeatedly recompressing old WebP files. Mix pieces between sets to catch uncovered base shorts, bare feet around socks, floating bandages, and accessories left behind when swapping a full set. Check picker scrolling at wide and narrow widths.

## Wrist registration

The worn character uses a 900 × 1350 coordinate system. Near y=710, its left wrist spans approximately x=297–338 and its right wrist x=561–602. Check cuff centers against those positions after packing, since trimming the source changes its registration. A cuff should meet the wrist before the hand widens around y=730. When a top covers an arm, keep the underlying skin occluded while preserving the visible neck and hands. Tighten an oversized collar opening in the artwork instead of moving the entire top farther up the neck.
