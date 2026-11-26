# Basketball artwork

Keep only editable inputs here. `shooting.webp` and `walking.webp` are the approved six-pose and eight-pose sheets, stored as lossless WebP. Their visible pixels and alpha are identical to the original PNG sources. `ball-anchors.json` places the shared basketball in the three holding poses. `prompts.txt` records the current art direction.

Runtime artwork lives in `assets/basketball/character` and `assets/basketball/scene`; sound cues live in `assets/basketball/audio`. The shooting atlas supplies idle, shooting, recovery, dribbling stance and the tutorial illustration. Walking uses one atlas. The same ball illustration supplies holding composites, flight, dribbling and filled progress icons. No separate ready/rest/tutorial images are needed.

To regenerate from the project root:

```powershell
& 'C:/Program Files/Blender Foundation/Blender 5.3/blender.exe' --background --python scripts/basketball/build.py
```

The build prepares the two drawing sheets, composites the ball behind the gripping fingers, normalizes the poses, renders them in Blender and exports both atlases with `src/basketball/character-frames.ts`. All intermediates go to the ignored `.cache/basketball` directory, which is removed after a successful export. The Blender scene is constructed from these inputs each time; a second packed copy of every drawing is unnecessary.

Preserve the head, ivory skin palette, transparent contours, six shooting poses, eight walking poses, 640 by 960 render canvas and fixed foot baseline. The common finish adds 30 render pixels below the hips and brings out pencil texture below the head. Runtime atlas cells stay 320 by 480, six columns, with unchanged registration and ball coordinates. Export from source at WebP quality 86 for shooting and 79 for walking, with alpha quality 100. Reuse the compressed scene artwork directly rather than repeatedly applying lossy compression.

Tests: `node tests/basketball-shot.test.mjs`; production check: `npm run build`.
