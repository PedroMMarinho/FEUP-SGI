from PIL import Image
import os

# Config
input_file = "cards.jpg"  # your big image
output_folder = "cards"

x_start = 195
y_start = 450
spacing_x = 33
spacing_y = 220
card_w = 349
card_h = 499

# suits in order (rows)
suits = ["D", "H", "S", "C"]

# values in order (columns)
values = ["R", "D", "V", "10", "9", "8", "7", "6", "5", "4", "3", "2", "A"]

# Target background color (RGB)
bg_color = (12, 111, 64)  # hex 0c6f40

# Open image
img = Image.open(input_file)

# Ensure output folder exists
os.makedirs(output_folder, exist_ok=True)

# Loop through suits (rows)
for row, suit in enumerate(suits):
    for col, value in enumerate(values):
        if value == "A":
            spacing_x = 32.5
        else:
            spacing_x = 33

        x = x_start + col * (card_w + spacing_x)
        y = y_start + row * (card_h + spacing_y)

        # Crop card
        card = img.crop((x, y, x + card_w, y + card_h)).convert("RGBA")

        # Remove background
        datas = card.getdata()
        newData = []
        for item in datas:
            # Compare pixel color with tolerance
            if abs(item[0] - bg_color[0]) < 20 and abs(item[1] - bg_color[1]) < 20 and abs(item[2] - bg_color[2]) < 20:
                # Replace with transparent
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)
        card.putdata(newData)

        # Save as PNG (with transparency)
        filename = f"{value}_{suit}.png"
        card.save(os.path.join(output_folder, filename), "PNG")

print("✅ All cards saved in folder without green background:", output_folder)
