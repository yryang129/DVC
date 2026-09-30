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

// Upper-right entrance, diagonal dive toward the lower-left perch point,
// then a stationary settle / wave / fold sequence.
let placements: [FramePlacement] = [
    .init(x: 1260, top: 20, width: 250),
    .init(x: 1130, top: 75, width: 285),
    .init(x: 990, top: 135, width: 325),
    .init(x: 835, top: 205, width: 365),
    .init(x: 690, top: 280, width: 410),
    .init(x: 555, top: 350, width: 445),
    .init(x: 450, top: 410, width: 475),
    .init(x: 365, top: 465, width: 490),
    .init(x: 385, top: 505, width: 455),
    .init(x: 385, top: 505, width: 455),
    .init(x: 365, top: 490, width: 475),
    .init(x: 355, top: 475, width: 485),
    .init(x: 365, top: 490, width: 475),
    .init(x: 385, top: 505, width: 455),
]

guard CommandLine.arguments.count == 16 else {
    fputs("Usage: compose_owl_only_trajectory_frames.swift <output-dir> <frame-01.png> ... <frame-14.png>\n", stderr)
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
    context.draw(image, in: CGRect(x: rect.minX, y: bottom, width: rect.width, height: rect.height))
}

let outputDirectory = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
try FileManager.default.createDirectory(at: outputDirectory, withIntermediateDirectories: true)

let colorSpace = CGColorSpaceCreateDeviceRGB()
let bitmapInfo = CGBitmapInfo.byteOrder32Big.rawValue | CGImageAlphaInfo.premultipliedLast.rawValue

for frameIndex in 0..<14 {
    let owl = loadImage(CommandLine.arguments[frameIndex + 2])
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
        owl,
        in: CGRect(x: placement.x, y: placement.top, width: placement.width, height: owlHeight),
        context: context
    )

    guard let outputImage = context.makeImage() else {
        fputs("Unable to create frame \(frameIndex + 1).\n", stderr)
        exit(1)
    }

    let filename = String(format: "owl-only-%02d.png", frameIndex + 1)
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
