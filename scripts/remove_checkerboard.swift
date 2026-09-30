import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

struct PixelPoint {
    let x: Int
    let y: Int
}

guard CommandLine.arguments.count == 3 else {
    fputs("Usage: remove_checkerboard.swift <input.png> <output.png>\n", stderr)
    exit(1)
}

let inputURL = URL(fileURLWithPath: CommandLine.arguments[1])
let outputURL = URL(fileURLWithPath: CommandLine.arguments[2])

guard
    let source = CGImageSourceCreateWithURL(inputURL as CFURL, nil),
    let image = CGImageSourceCreateImageAtIndex(source, 0, nil)
else {
    fputs("Unable to read the input image.\n", stderr)
    exit(1)
}

let width = image.width
let height = image.height
let bytesPerRow = width * 4
let colorSpace = CGColorSpaceCreateDeviceRGB()
let bitmapInfo = CGBitmapInfo.byteOrder32Big.rawValue | CGImageAlphaInfo.premultipliedLast.rawValue
var pixels = [UInt8](repeating: 0, count: height * bytesPerRow)

guard let context = CGContext(
    data: &pixels,
    width: width,
    height: height,
    bitsPerComponent: 8,
    bytesPerRow: bytesPerRow,
    space: colorSpace,
    bitmapInfo: bitmapInfo
) else {
    fputs("Unable to create the image context.\n", stderr)
    exit(1)
}

context.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))

func isBackgroundCandidate(_ offset: Int) -> Bool {
    let red = Int(pixels[offset])
    let green = Int(pixels[offset + 1])
    let blue = Int(pixels[offset + 2])
    let maximum = max(red, green, blue)
    let minimum = min(red, green, blue)
    let saturation = maximum - minimum
    let luminance = (red * 299 + green * 587 + blue * 114) / 1000
    return saturation <= 20 && luminance >= 82 && luminance <= 246
}

var background = [Bool](repeating: false, count: width * height)
var queue = [PixelPoint]()
queue.reserveCapacity(width * height / 2)

func enqueueIfBackground(_ x: Int, _ y: Int) {
    guard x >= 0, x < width, y >= 0, y < height else { return }
    let index = y * width + x
    guard !background[index] else { return }
    let offset = y * bytesPerRow + x * 4
    guard isBackgroundCandidate(offset) else { return }
    background[index] = true
    queue.append(PixelPoint(x: x, y: y))
}

for x in 0..<width {
    enqueueIfBackground(x, 0)
    enqueueIfBackground(x, height - 1)
}

for y in 0..<height {
    enqueueIfBackground(0, y)
    enqueueIfBackground(width - 1, y)
}

var cursor = 0
while cursor < queue.count {
    let point = queue[cursor]
    cursor += 1
    enqueueIfBackground(point.x - 1, point.y)
    enqueueIfBackground(point.x + 1, point.y)
    enqueueIfBackground(point.x, point.y - 1)
    enqueueIfBackground(point.x, point.y + 1)
}

for y in 0..<height {
    for x in 0..<width {
        let index = y * width + x
        if background[index] {
            pixels[y * bytesPerRow + x * 4 + 3] = 0
        }
    }
}

guard let outputImage = context.makeImage() else {
    fputs("Unable to create the output image.\n", stderr)
    exit(1)
}

guard let destination = CGImageDestinationCreateWithURL(
    outputURL as CFURL,
    UTType.png.identifier as CFString,
    1,
    nil
) else {
    fputs("Unable to create the output destination.\n", stderr)
    exit(1)
}

CGImageDestinationAddImage(destination, outputImage, nil)
guard CGImageDestinationFinalize(destination) else {
    fputs("Unable to save the output image.\n", stderr)
    exit(1)
}

print("Saved transparent image to \(outputURL.path)")
