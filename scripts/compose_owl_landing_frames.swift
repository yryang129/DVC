import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

private let canvasWidth = 1536
private let canvasHeight = 1024

struct FramePlacement {
    let x: CGFloat
    let top: CGFloat
    let width: CGFloat
}

let placements: [FramePlacement] = [
    .init(x: 1190, top: 20, width: 300),
    .init(x: 1050, top: 100, width: 340),
    .init(x: 850, top: 180, width: 390),
    .init(x: 650, top: 250, width: 450),
    .init(x: 500, top: 300, width: 480),
    .init(x: 350, top: 390, width: 500),
    .init(x: 330, top: 435, width: 445),
    .init(x: 330, top: 435, width: 445),
]

guard CommandLine.arguments.count == 11 else {
    fputs("Usage: compose_owl_landing_frames.swift <branch.png> <output-dir> <frame-01.png> ... <frame-08.png>\n", stderr)
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

func drawTopLeft(_ image: CGImage, in rect: CGRect, context: CGContext) {
    let bottom = CGFloat(canvasHeight) - rect.minY - rect.height
    context.draw(
        image,
        in: CGRect(x: rect.minX, y: bottom, width: rect.width, height: rect.height)
    )
}

let branch = loadImage(CommandLine.arguments[1])
let outputDirectory = URL(fileURLWithPath: CommandLine.arguments[2], isDirectory: true)
let fileManager = FileManager.default
try fileManager.createDirectory(at: outputDirectory, withIntermediateDirectories: true)

let colorSpace = CGColorSpaceCreateDeviceRGB()
let bitmapInfo = CGBitmapInfo.byteOrder32Big.rawValue | CGImageAlphaInfo.premultipliedLast.rawValue

for frameIndex in 0..<8 {
    let owl = loadImage(CommandLine.arguments[frameIndex + 3])
    let placement = placements[frameIndex]
    let owlHeight = placement.width * CGFloat(owl.height) / CGFloat(owl.width)

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
    context.interpolationQuality = .high

    drawTopLeft(
        branch,
        in: CGRect(x: -80, y: 300, width: 1150, height: 767),
        context: context
    )
    drawTopLeft(
        owl,
        in: CGRect(x: placement.x, y: placement.top, width: placement.width, height: owlHeight),
        context: context
    )

    guard let outputImage = context.makeImage() else {
        fputs("Unable to create frame \(frameIndex + 1).\n", stderr)
        exit(1)
    }

    let filename = String(format: "owl-landing-%02d.png", frameIndex + 1)
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
    print("Saved \(outputURL.path)")
}
