import * as fs from 'fs'
//https://www.npmjs.com/package/screenshot-desktop
import * as cv from 'opencv4nodejs'
import screenshot from 'screenshot-desktop'
//マップ画像の高画質化が必須

function findMap() {
  const akaze = new cv.AKAZEDetector()

  const targetImg = cv.imread(`${__dirname}/t.png`)
  const mapImg = cv.imread(`${__dirname}/map.png`)

  const targetImgKeyPoints = akaze.detect(targetImg)
  const mapImgKeyPoints = akaze.detect(mapImg)

  const targetImgDescriptors = akaze.compute(targetImg, targetImgKeyPoints)
  const mapImgDescriptors = akaze.compute(mapImg, mapImgKeyPoints)

  const bf = new cv.BFMatcher(cv.NORM_HAMMING)
  const matches = bf.knnMatch(targetImgDescriptors, mapImgDescriptors, 2)
  const goods = matches
    .map((match) => {
      const [m, n] = match as cv.DescriptorMatch[]
      if (m.distance < 0.8 * n.distance) {
        return m
      }
      return
    })
    .filter((match): match is cv.DescriptorMatch => match !== undefined)
  if (goods.length === 0) {
    throw new Error("don't have good match")
  }
  const bestN = 40
  const bestMatches = goods
    .sort((match1, match2) => match1.distance - match2.distance)
    .slice(0, bestN)
  return cv.drawMatches(
    targetImg,
    mapImg,
    targetImgKeyPoints,
    mapImgKeyPoints,
    bestMatches
  )
}

cv.imwrite(`AKAZEMatching.png`, findMap())
