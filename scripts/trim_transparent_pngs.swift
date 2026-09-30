import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

guard CommandLine.arguments.count >= 4 else {
    fputs("Usage: trim_transparent_pngs.swift <output-dir> <output-prefix> <input-01.png> [input-02.png ...]\n", stderr)
    exit(1)
}

let outputDirectory = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
let outputPrefix = CommandLine.arguments[2]
let inputPaths = Array(CommandLine.arguments.dropFirst(3))
let padding = 12
let alphaThreshold: UInt8 = 2

try FileManager.default.createDirectory(at: outputDirectory, withIntermediateDirectories: true)

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

func alphaBounds(of image: CGImage) -> CGRect? {
    let width = image.width
    let height = image.height
    let bytesPerRow = width * 4
    var pixels = [UInt8](repeating: 0, count: bytesPerRow * height)
    let colorSpace = CGColorSpaceCreateDeviceRGB()
    let bitmapInfo = CGBitmapInfo.byteOrder32Big.rawValue | CGImageAlphaInfo.premultipliedLast.rawValue

    guard let context = CGContext(
        data: &pixels,
        width: width,
        height: height,
        bitsPerComponent: 8,
        bytesPerRow: bytesPerRow,
        space: colorSpace,
        bitmapInfo: bitmapInfo
    ) else { return nil }

    context.clear(CGRect(x: 0, y: 0, width: width, height: height))
    context.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))

    var minX = width
    var minY = height
    var maxX = -1
    var maxY = -1

    for y in 0..<height {
        let rowOffset = y * bytesPerRow
        for x in 0..<width {
            let alpha = pixels[rowOffset + x * 4 + 3]
            if alpha > alphaThreshold {
                minX = min(minX, x)
                minY = min(minY, y)
                maxX = max(maxX, x)
                maxY = max(maxY, y)
            }
        }
    }

    guard maxX >= minX, maxY >= minY else { return nil }

    minX = max(0, minX - padding)
    minY = max(0, minY - padding)
    maxX = min(width - 1, maxX + padding)
    maxY = min(height - 1, maxY + padding)

    return CGRect(x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1)
}

for (index, inputPath) in inputPaths.enumerated() {
    let image = loadImage(inputPath)
    guard let bounds = alphaBounds(of: image), let cropped = image.cropping(to: bounds) else {
        fputs("Unable to crop image at \(inputPath).\n", stderr)
        exit(1)
    }

    let filename = String(format: "%@-%02d.png", outputPrefix, index + 1)
    let outputURL = outputDirectory.appendingPathComponent(filename)
    guard let destination = CGImageDestinationCreateWithURL(
        outputURL as CFURL,
        UTType.png.identifier as CFString,
        1,
        nil
    ) else {
        fputs("Unable to create output destination for \(filename).\n", stderr)
        exit(1)
    }

    CGImageDestinationAddImage(destination, cropped, nil)
    guard CGImageDestinationFinalize(destination) else {
        fputs("Unable to save \(filename).\n", stderr)
        exit(1)
    }
    print("Saved \(outputURL.path) [\(cropped.width)x\(cropped.height)]")
}
