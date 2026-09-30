import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

guard CommandLine.arguments.count == 4 else {
    fputs("Usage: compose_owl_branch_option.swift <branch.png> <owl.png> <output.png>\n", stderr)
    exit(1)
}

let canvasWidth = 1536
let canvasHeight = 1024

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
let owl = loadImage(CommandLine.arguments[2])
let colorSpace = CGColorSpaceCreateDeviceRGB()
let bitmapInfo = CGBitmapInfo.byteOrder32Big.rawValue | CGImageAlphaInfo.premultipliedLast.rawValue

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

let owlWidth: CGFloat = 445
let owlHeight = owlWidth * CGFloat(owl.height) / CGFloat(owl.width)
drawTopLeft(
    owl,
    in: CGRect(x: 330, y: 435, width: owlWidth, height: owlHeight),
    context: context
)

guard let outputImage = context.makeImage() else {
    fputs("Unable to create output image.\n", stderr)
    exit(1)
}

let outputURL = URL(fileURLWithPath: CommandLine.arguments[3])
try FileManager.default.createDirectory(
    at: outputURL.deletingLastPathComponent(),
    withIntermediateDirectories: true
)
guard let destination = CGImageDestinationCreateWithURL(
    outputURL as CFURL,
    UTType.png.identifier as CFString,
    1,
    nil
) else {
    fputs("Unable to create output destination.\n", stderr)
    exit(1)
}

CGImageDestinationAddImage(destination, outputImage, nil)
guard CGImageDestinationFinalize(destination) else {
    fputs("Unable to save output image.\n", stderr)
    exit(1)
}

print("Saved \(outputURL.path)")
