import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

guard CommandLine.arguments.count == 4 else {
    fputs("Usage: composite_mascot.swift <balloons.png> <owl.png> <output.png>\n", stderr)
    exit(1)
}

func loadImage(_ path: String) -> CGImage {
    let url = URL(fileURLWithPath: path)
    guard
        let source = CGImageSourceCreateWithURL(url as CFURL, nil),
        let image = CGImageSourceCreateImageAtIndex(source, 0, nil)
    else {
        fputs("Unable to read image at \(path).\n", stderr)
        exit(1)
    }
    return image
}

let balloonImage = loadImage(CommandLine.arguments[1])
let owlImage = loadImage(CommandLine.arguments[2])

guard balloonImage.width == owlImage.width, balloonImage.height == owlImage.height else {
    fputs("Input images must have matching dimensions.\n", stderr)
    exit(1)
}

let width = balloonImage.width
let height = balloonImage.height
let bytesPerRow = width * 4
let colorSpace = CGColorSpaceCreateDeviceRGB()
let bitmapInfo = CGBitmapInfo.byteOrder32Big.rawValue | CGImageAlphaInfo.premultipliedLast.rawValue

func pixelBuffer(for image: CGImage) -> [UInt8] {
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
        fputs("Unable to create an image context.\n", stderr)
        exit(1)
    }
    context.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))
    return pixels
}

let balloonPixels = pixelBuffer(for: balloonImage)
let owlPixels = pixelBuffer(for: owlImage)
var outputPixels = [UInt8](repeating: 0, count: height * bytesPerRow)

func smoothstep(_ edge0: Double, _ edge1: Double, _ value: Double) -> Double {
    let amount = min(1, max(0, (value - edge0) / (edge1 - edge0)))
    return amount * amount * (3 - 2 * amount)
}

func compositePixel(
    foreground: (Double, Double, Double, Double),
    background: (Double, Double, Double, Double)
) -> (Double, Double, Double, Double) {
    let outputAlpha = foreground.3 + background.3 * (1 - foreground.3)
    guard outputAlpha > 0.0001 else { return (0, 0, 0, 0) }
    return (
        foreground.0 + background.0 * (1 - foreground.3),
        foreground.1 + background.1 * (1 - foreground.3),
        foreground.2 + background.2 * (1 - foreground.3),
        outputAlpha
    )
}

let owlShiftUp = 58

for rasterY in 0..<height {
    let visualY = rasterY
    let balloonOpacity = 1 - smoothstep(805, 900, Double(visualY))
    let owlOpacity = smoothstep(790, 875, Double(visualY))
    let owlVisualY = visualY + owlShiftUp
    let owlRasterY = owlVisualY

    for x in 0..<width {
        let outputOffset = rasterY * bytesPerRow + x * 4
        let balloonOffset = outputOffset

        let balloonAlpha = Double(balloonPixels[balloonOffset + 3]) / 255 * balloonOpacity
        let balloon = (
            Double(balloonPixels[balloonOffset]) / 255 * balloonOpacity,
            Double(balloonPixels[balloonOffset + 1]) / 255 * balloonOpacity,
            Double(balloonPixels[balloonOffset + 2]) / 255 * balloonOpacity,
            balloonAlpha
        )

        var owl = (0.0, 0.0, 0.0, 0.0)
        if owlRasterY >= 0, owlRasterY < height {
            let owlOffset = owlRasterY * bytesPerRow + x * 4
            let alpha = Double(owlPixels[owlOffset + 3]) / 255 * owlOpacity
            owl = (
                Double(owlPixels[owlOffset]) / 255 * owlOpacity,
                Double(owlPixels[owlOffset + 1]) / 255 * owlOpacity,
                Double(owlPixels[owlOffset + 2]) / 255 * owlOpacity,
                alpha
            )
        }

        let result = compositePixel(foreground: owl, background: balloon)
        outputPixels[outputOffset] = UInt8(min(255, max(0, result.0 * 255)).rounded())
        outputPixels[outputOffset + 1] = UInt8(min(255, max(0, result.1 * 255)).rounded())
        outputPixels[outputOffset + 2] = UInt8(min(255, max(0, result.2 * 255)).rounded())
        outputPixels[outputOffset + 3] = UInt8(min(255, max(0, result.3 * 255)).rounded())
    }
}

guard let outputContext = CGContext(
    data: &outputPixels,
    width: width,
    height: height,
    bitsPerComponent: 8,
    bytesPerRow: bytesPerRow,
    space: colorSpace,
    bitmapInfo: bitmapInfo
), let outputImage = outputContext.makeImage() else {
    fputs("Unable to create the output image.\n", stderr)
    exit(1)
}

let outputURL = URL(fileURLWithPath: CommandLine.arguments[3])
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

print("Saved composite mascot to \(outputURL.path)")
