// Twitter card image — reuses the same generator as the Open Graph card so the
// summary_large_image preview matches the social share card exactly.
import OgImage, { alt as ogAlt, size as ogSize, contentType as ogContentType } from './opengraph-image'

export const runtime = 'edge'
export const alt = ogAlt
export const size = ogSize
export const contentType = ogContentType

export default OgImage
