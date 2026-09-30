import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

private let canvasWidth = 1374
private let canvasHeight = 1137
private let bottomPadding: CGFloat = 12

guard CommandLine.arguments.count >= 4 else {
    fputs("Usage: pad_owl_rest_frames.swift <output-dir> <first-frame-number> <input.png> [input.png ...]\n", stderr)
    exit(1)
}

let outputDirectory = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
guard let firstFrameNumber = Int(CommandLine.arguments[2]) else {
    fputs("Invalid first frame number.\n", stderr)
    exit(1)
}
let inputPaths = Array(CommandLine.arguments.dropFirst(3))
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

let colorSpace = CGColorSpaceCreateDeviceRGB()
let bitmapInfo = CGBitmapInfo.byteOrder32Big.rawValue | CGImageAlphaInfo.premultipliedLast.rawValue

for (offset, inputPath) in inputPaths.enumerated() {
    let image = loadImage(inputPath)
    guard image.width <= canvasWidth, image.height <= canvasHeight else {
        fputs("Input is larger than the target canvas: \(inputPath).\n", stderr)
        exit(1)
    }

    guard let context = CGContext(
        data: nil,
        width: canvasWidth,
        height: canvasHeight,
        bitsPerComponent: 8,
        bytesPerRow: canvasWidth * 4,
        space: colorSpace,
        bitmapInfo: bitmapInfo
    ) else {
        fputs("Unable to create bitmap context.\n", stderr)
        exit(1)
    }

    context.clear(CGRect(x: 0, y: 0, width: canvasWidth, height: canvasHeight))
    context.interpolationQuality = .none

    let x = CGFloat(canvasWidth - image.width) / 2
    let y = bottomPadding
    context.draw(
        image,
        in: CGRect(x: x, y: y, width: CGFloat(image.width), height: CGFloat(image.height))
    )

    guard let outputImage = context.makeImage() else {
        fputs("Unable to create padded image.\n", stderr)
        exit(1)
    }

    let frameNumber = firstFrameNumber + offset
    let filename = String(format: "owl-sprite-%02d.png", frameNumber)
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

    CGImageDestinationAddImage(destination, outputImage, nil)
    guard CGImageDestinationFinalize(destination) else {
        fputs("Unable to save \(filename).\n", stderr)
        exit(1)
    }
    print("Saved \(outputURL.path) [\(canvasWidth)x\(canvasHeight)]")
}
