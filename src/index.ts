import * as fs from 'fs'
//https://www.npmjs.com/package/screenshot-desktop
import * as cv from 'opencv4nodejs'
import screenshot from 'screenshot-desktop'
//マップ画像の高画質化が必須

async function findMap() {
  const akaze = new cv.AKAZEDetector()

  const targetImgOri = await cv.imreadAsync(`${__dirname}/t.png`)
  const targetImg = targetImgOri.resize(
    Math.floor(targetImgOri.rows * 1.5),
    Math.floor(targetImgOri.cols * 1.5)
  )
  const mapImg = await cv.imreadAsync(`${__dirname}/map.png`)

  const targetImgKeyPoints = await akaze.detectAsync(targetImg)

  const targetImgDescriptors = await akaze.computeAsync(
    targetImg,
    targetImgKeyPoints
  )
  /*/
  const mapImgKeyPoints = await akaze.detectAsync(mapImg)
  const mapImgDescriptors = await akaze.computeAsync(mapImg, mapImgKeyPoints)
  fs.writeFileSync(
    'mapImgKeyPoints.dat',
    JSON.stringify(mapImgKeyPoints),
    'utf-8'
  )
  fs.writeFileSync(
    'mapImgDescriptors.dat',
    JSON.stringify(mapImgDescriptors.getDataAsArray()),
    'utf-8'
  )
  /*/
  const mapImgKeyPoints0 = (
    JSON.parse(fs.readFileSync('mapImgKeyPoints.dat', 'utf-8')) as cv.KeyPoint[]
  ).map(
    (key) =>
      new cv.KeyPoint(
        new cv.Point2(key.pt.x, key.pt.y),
        key.size,
        key.angle,
        key.response,
        key.octave,
        key.class_id
      )
  )
  const mapImgDescriptors0 = new cv.Mat(
    JSON.parse(fs.readFileSync('mapImgDescriptors.dat', 'utf-8')) as number[][],
    0
  )

  const bf = new cv.BFMatcher(cv.NORM_HAMMING)
  const matches = bf.knnMatch(targetImgDescriptors, mapImgDescriptors0, 2)
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
  const result = cv.drawMatches(
    targetImg,
    mapImg,
    targetImgKeyPoints,
    mapImgKeyPoints0,
    bestMatches
  )
  await cv.imwriteAsync(`AKAZEMatching.png`, result)
}
void findMap()
