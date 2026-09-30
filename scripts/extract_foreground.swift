import CoreImage
import Foundation
import ImageIO
import UniformTypeIdentifiers
import Vision

guard CommandLine.arguments.count == 3 else {
    fputs("Usage: extract_foreground.swift <input.png> <output.png>\n", stderr)
    exit(1)
}

let inputURL = URL(fileURLWithPath: CommandLine.arguments[1])
let outputURL = URL(fileURLWithPath: CommandLine.arguments[2])

guard
    let source = CGImageSourceCreateWithURL(inputURL as CFURL, nil),
    let sourceImage = CGImageSourceCreateImageAtIndex(source, 0, nil)
else {
    fputs("Unable to read the input image.\n", stderr)
    exit(1)
}

let request = VNGenerateForegroundInstanceMaskRequest()
let requestHandler = VNImageRequestHandler(cgImage: sourceImage)

do {
    try requestHandler.perform([request])
} catch {
    fputs("Unable to identify the foreground: \(error)\n", stderr)
    exit(1)
}

guard let observation = request.results?.first else {
    fputs("No foreground subject was found.\n", stderr)
    exit(1)
}

let maskBuffer: CVPixelBuffer
do {
    maskBuffer = try observation.generateScaledMaskForImage(
        forInstances: observation.allInstances,
        from: requestHandler
    )
} catch {
    fputs("Unable to create the foreground mask: \(error)\n", stderr)
    exit(1)
}

let extent = CGRect(x: 0, y: 0, width: sourceImage.width, height: sourceImage.height)
let foreground = CIImage(cgImage: sourceImage)
let transparent = CIImage(color: .clear).cropped(to: extent)
let mask = CIImage(cvPixelBuffer: maskBuffer).cropped(to: extent)
let result = foreground.applyingFilter(
    "CIBlendWithMask",
    parameters: [
        kCIInputBackgroundImageKey: transparent,
        kCIInputMaskImageKey: mask,
    ]
)

let context = CIContext(options: [.useSoftwareRenderer: false])

do {
    try context.writePNGRepresentation(
        of: result,
        to: outputURL,
        format: .RGBA8,
        colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!
    )
} catch {
    fputs("Unable to save the transparent image: \(error)\n", stderr)
    exit(1)
}

print("Saved transparent foreground to \(outputURL.path)")
