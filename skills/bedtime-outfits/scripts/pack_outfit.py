"""Pack the chosen garment cutouts for the Bedtime character."""

import argparse
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw


CELL_WIDTH, CELL_HEIGHT = 256, 320
ITEMS = ('top', 'pants', 'headwear', 'mask', 'socks')


def cell_box(index, width, height):
    column, row = index % 3, index // 3
    return (round(column * width / 3), round(row * height / 2),
            round((column + 1) * width / 3), round((row + 1) * height / 2))


def extract_item(cell, open_hood):
    alpha = cell.getchannel('A')
    corners = [(0, 0), (cell.width - 1, 0), (0, cell.height - 1),
               (cell.width - 1, cell.height - 1)]
    if max(alpha.getpixel(point) for point in corners) > 24:
        red, green, blue, _ = cell.split()
        near_white = ImageChops.darker(ImageChops.darker(red, green), blue)
        background = near_white.point(lambda value: 255 if value >= 235 else 0)
        for point in corners + ([(cell.width // 2, cell.height // 2)] if open_hood else []):
            if background.getpixel(point) == 255:
                ImageDraw.floodfill(background, point, 128)
        alpha = ImageChops.multiply(alpha, background.point(lambda value: 0 if value == 128 else 255))

    alpha = alpha.point(lambda value: 0 if value < 20 else value)
    solid = alpha.point(lambda value: 255 if value >= 80 else 0)
    box = solid.getbbox()
    if not box or box == (0, 0, cell.width, cell.height):
        raise ValueError('Could not isolate a garment. Check the sheet layout and transparency.')
    cell.putalpha(alpha)
    return cell.crop(box)


def pack(source, destination, parts, hood):
    sheet = Image.open(source).convert('RGBA')
    atlas = Image.new('RGBA', (CELL_WIDTH * 3, CELL_HEIGHT * 2))
    for index, name in enumerate(ITEMS):
        if name not in parts:
            continue
        box = cell_box(index, *atlas.size)
        try:
            item = extract_item(sheet.crop(cell_box(index, *sheet.size)), name == 'headwear' and hood)
        except ValueError as error:
            raise ValueError(f'{name}: {error}') from error
        # Preserve each drawing as a whole, including the sock contours.
        packed = item.resize((CELL_WIDTH, CELL_HEIGHT), Image.Resampling.LANCZOS)
        atlas.paste(packed, box[:2])
    atlas.save(destination, 'WEBP', quality=85, method=6)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path, help='the generated 3-column × 2-row sheet')
    parser.add_argument('destination', type=Path, help='the fitted WebP atlas')
    parser.add_argument('--parts', nargs='+', choices=ITEMS, default=('top', 'pants', 'socks'),
                        help='cells to keep, leaving all other cells transparent')
    parser.add_argument('--hood', action='store_true', help='preserve an open face in the headwear cutout')
    args = parser.parse_args()
    pack(args.source, args.destination, args.parts, args.hood)
