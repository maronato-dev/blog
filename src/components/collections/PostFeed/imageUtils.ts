// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as url from "native-url"

const imageSizes = {
  xxs: {
    width: 30,
  },
  xs: {
    width: 100,
  },
  s: {
    width: 300,
  },
  m: {
    width: 600,
  },
  l: {
    width: 1000,
  },
  xl: {
    width: 2000,
  },
}

const imageWidths = Object.values(imageSizes).map(size => size.width)

type RequestedSize = keyof typeof imageSizes | number

export function getImageUrl(
  requestedImageUrl?: string | null,
  requestedSize?: RequestedSize
) {
  if (!requestedImageUrl) {
    return
  }
  if (!requestedSize) {
    return requestedImageUrl
  }

  // CASE: if you pass an external image, there is nothing we want to do to it!
  const isInternalImage = detectInternalImage(requestedImageUrl)
  if (!isInternalImage) {
    return requestedImageUrl
  }

  if (!validRequestedSize(requestedSize)) {
    return requestedImageUrl
  }

  return getImageWithSize(requestedImageUrl, requestedSize)
}

function validRequestedSize(requestedSize: RequestedSize) {
  if (typeof requestedSize === "string" && requestedSize in imageSizes) {
    return true
  } else if (
    typeof requestedSize === "number" &&
    imageWidths.includes(requestedSize)
  ) {
    return true
  }
  return false
}

function getRequestedWidth(requestedSize: RequestedSize) {
  if (typeof requestedSize === "string") {
    return imageSizes[requestedSize].width
  } else {
    return requestedSize
  }
}

function detectInternalImage(requestedImageUrl: string) {
  const siteUrl = window.location.origin
  const isAbsoluteImage = /https?:\/\//.test(requestedImageUrl)
  const isAbsoluteInternalImage =
    isAbsoluteImage && requestedImageUrl.startsWith(siteUrl)

  // CASE: imagePath is a "protocol relative" url e.g. "//www.gravatar.com/ava..."
  //       by resolving the the imagePath relative to the blog url, we can then
  //       detect if the imagePath is external, or internal.
  const isRelativeInternalImage =
    !isAbsoluteImage &&
    url.resolve(siteUrl, requestedImageUrl).startsWith(siteUrl)

  return isAbsoluteInternalImage || isRelativeInternalImage
}

function getImageWithSize(
  imagePath: string,
  requestedSize: RequestedSize
): string {
  const hasLeadingSlash = imagePath[0] === "/"

  if (hasLeadingSlash) {
    return "/" + getImageWithSize(imagePath.slice(1), requestedSize)
  }

  const imageSize = getRequestedWidth(requestedSize)

  const [imagePrefix, ...imageSuffix] = imagePath.split("/images/")
  const imageSizePath = imagePrefix + "/images/" + `size/w${imageSize}/`
  return imageSizePath + imageSuffix.join("/images/")
}

export function getSrcset(imagePath?: string | null) {
  return Object.entries(imageSizes)
    .map(([size, { width }]) => {
      return `${getImageUrl(imagePath, size as RequestedSize)} ${width}w`
    })
    .join(", ")
}
