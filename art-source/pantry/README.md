# Go, Grow, Glow! art

The fifteen transparent food sprites, red-and-cream gingham cloth, and original honey-oak tray use the Bedroom Time colored-pencil style. The tray has rounded corners and open handles. Scalloped ivory lace outlines the play area. The trays keep their small offsets and rotations. Shadows sit under the tray bases and at the visible contact points of the serving food.

`prompts.json` records the ImageGen prompts. Runtime files are grouped in `assets/pantry/food`, `scene` and `audio`. The food sprites stay 384 × 320 with clean alpha, and the tray stays 384 × 216. The cloth is 1536 × 1024, with a 720 × 480 version for narrow viewports. The 512 × 512 paper texture sits behind the clue text. The 672 × 504 home card reuses the game art.

Export food and tray sprites as WebP with smart subsampling and alpha quality 100. Compare decoded alpha byte for byte against the prepared raster. Clear the faint alpha haze around generated cutouts before scaling them into the sprite canvas. Beef, broccoli and potatoes use quality 50. Pancakes use quality 58. Bread uses quality 58. At serving and tray sizes, the replacements stay within 4.3 and 3.1 RGB RMS error out of 255 respectively. The desktop cloth, compact cloth and home card use quality 52, 60 and 58, respectively. Those exports retain the same dimensions and alpha as their previous versions. Keep generated candidates and compression checks in ignored `.cache/pantry-review`.

The wrong-tray X comes from the shared activity styles. Regenerate the success mark with `blender --background --factory-startup --python scripts/pantry/render-marks.py` if needed. The three cue files in `audio` are 22.05 kHz mono MP3s at 48 kbps. They load the first time they play and retain the original WAV durations.

Runtime art and audio, including both cloth sizes and the home card, total 534,428 bytes, down from 546,090. The three MP3s total 11,652 bytes. A single opening cloth request is 144,956 bytes at desktop widths or 56,754 bytes at narrow widths.
