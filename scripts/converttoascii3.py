import os.path
import PIL.Image

ASCII_CHARS = ["@", "#", "＄", "%", "?", "*", "+", ";", ":", ",", "."]


def resize(image, new_width = 100):
    old_width, old_height = image.size
    new_height = new_width * old_height / old_width
    return image.resize((int(new_width), int(new_height)))


def to_greyscale(image):
    return image.convert("L")


def pixel_to_ascii(image):
    pixels = image.getdata()
    ascii_str = ""
    for pixel in pixels:
        ascii_str += ASCII_CHARS[pixel//25]
    return ascii_str


def main():
    path = input("Enter the path to the image field: ")
    try:
        image = PIL.Image.open(path)
    except:
        print(f"Unable to find image {path}")
        exit(1)
    image = resize(image)
    greyscale_image = to_greyscale(image)
    ascii_str = pixel_to_ascii(greyscale_image)
    img_width = greyscale_image.width
    ascii_str_len = len(ascii_str)
    ascii_img = ""
    for i in range(0, ascii_str_len, img_width):
        ascii_img += ascii_str[i:i+img_width] + "\n"
    with open(f"{os.path.splitext(path)[0]}.txt", "w") as f:
        f.write(ascii_img)


main()
