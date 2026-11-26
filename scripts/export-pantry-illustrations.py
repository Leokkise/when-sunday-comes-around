"""Export the transparent Pantry Pals props from the editable sprite atlas."""

from pathlib import Path

from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1]
atlas = Image.open(root / 'art-source' / 'pantry-illustrations.png').convert('RGBA')
assets = root / 'assets' / 'pantry'
foods = ('rice', 'pandesal', 'eggs', 'fish', 'carrot', 'apple', 'candy', 'chips')
columns = (0, 418, 803, 1254)
rows = (0, 418, 836, 1254)


def sprite(index):
    row, column = divmod(index, 3)
    cell = atlas.crop((columns[column], rows[row], columns[column + 1], rows[row + 1]))
    alpha = cell.getchannel('A').point(lambda value: 0 if value < 10 else value)
    bounds = alpha.getbbox()
    assert bounds and min(bounds[0], bounds[1], cell.width - bounds[2], cell.height - bounds[3]) > 4
    cell.putalpha(alpha)
    return cell.crop(bounds)


def save(image, name, size, padding):
    image.thumbnail((size[0] - padding * 2, size[1] - padding * 2), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', size)
    canvas.paste(image, ((size[0] - image.width) // 2, (size[1] - image.height) // 2))
    canvas.save(assets / f'{name}.webp', quality=88, method=6)


for index, name in enumerate(foods):
    save(sprite(index), name, (384, 320), 12)

tray = sprite(8)
save(tray.copy(), 'tray-go', (384, 216), 5)
for group, (dark, middle, light) in {
    'grow': ('#555255', '#899eaa', '#ebe8db'),
    'glow': ('#504b37', '#8d9f72', '#efe8c1'),
    'junk': ('#664239', '#bf8378', '#f7dfcf'),
}.items():
    tinted = ImageOps.colorize(tray.convert('L'), dark, light, mid=middle, midpoint=162)
    tinted.putalpha(tray.getchannel('A'))
    save(tinted, f'tray-{group}', (384, 216), 5)
