import * as fs from 'fs'
import * as cv from 'opencv4nodejs'
import { Vec2 } from 'opencv4nodejs'
import screenshot from 'screenshot-desktop'
import { WebSocketServer } from 'ws'
const akaze = new cv.AKAZEDetector()
let result = ''
async function findMap() {
  await screenshot({ filename: `${__dirname}/t.png` })
  const targetImgOri = await cv.imreadAsync(
    `${__dirname}/t.png`,
    cv.IMREAD_GRAYSCALE
  )
  const region = new cv.Rect(100, 50, 450, 400)
  const targetImg = targetImgOri
    .resize(
      Math.floor(targetImgOri.rows * 2),
      Math.floor(targetImgOri.cols * 2)
    )
    .getRegion(region)

  const targetImgKeyPoints = await akaze.detectAsync(targetImg)

  const targetImgDescriptors = await akaze.computeAsync(
    targetImg,
    targetImgKeyPoints
  )
  const mapImgKeyPoints0 = (
    JSON.parse(
      fs.readFileSync(`${process.argv[2]}ImgKeyPoints.dat`, 'utf-8')
    ) as cv.KeyPoint[]
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
    JSON.parse(
      fs.readFileSync(`${process.argv[2]}ImgDescriptors.dat`, 'utf-8')
    ) as number[][],
    0
  )

  const bf = new cv.BFMatcher(cv.NORM_HAMMING2)
  const matches = bf.match(targetImgDescriptors, mapImgDescriptors0)
  if (matches.length === 0) {
    result = "don't match"
    return
  }
  const bestN = 40
  const bestMatches = matches
    .sort((match1, match2) => match1.distance - match2.distance)
    .slice(0, bestN)

  const resultMatches: cv.DescriptorMatch[] = []
  for (let i = 0; i < bestMatches.length - 1; i++) {
    const minMatches: MinMatches = {
      minDeg: 360,
      descriptorMatchsI: bestMatches[i],
    }
    for (let j = i + 1; j < bestMatches.length; j++) {
      if (i == j) continue
      const mapRad = Math.atan(
        (mapImgKeyPoints0[bestMatches[i].trainIdx].pt.y -
          mapImgKeyPoints0[bestMatches[j].trainIdx].pt.y) /
          (mapImgKeyPoints0[bestMatches[i].trainIdx].pt.x -
            mapImgKeyPoints0[bestMatches[j].trainIdx].pt.x)
      )
      const targetRad = Math.atan(
        (targetImgKeyPoints[bestMatches[i].queryIdx].pt.y -
          targetImgKeyPoints[bestMatches[j].queryIdx].pt.y) /
          (targetImgKeyPoints[bestMatches[i].queryIdx].pt.x -
            targetImgKeyPoints[bestMatches[j].queryIdx].pt.x)
      )
      let mapDeg = (mapRad * (180 / Math.PI)) % 360
      let targetDeg = (targetRad * (180 / Math.PI)) % 360
      mapDeg = mapDeg < 0 ? 360 + mapDeg : mapDeg
      targetDeg = targetDeg < 0 ? 360 + targetDeg : targetDeg
      const diffDeg = Math.abs(mapDeg - targetDeg)
      if (isNaN(diffDeg)) continue
      if (minMatches.minDeg > diffDeg) {
        minMatches.descriptorMatchsJ = bestMatches[j]
        minMatches.minDeg = diffDeg
      }
    }
    if (minMatches.minDeg > 0.1 || minMatches.descriptorMatchsI.distance > 50)
      continue
    resultMatches.push(minMatches.descriptorMatchsI)
    if (
      minMatches.descriptorMatchsJ === undefined ||
      minMatches.descriptorMatchsJ.distance > 50
    )
      continue
    resultMatches.push(minMatches.descriptorMatchsJ)
  }
  if (resultMatches.length < 2) {
    result = "don't match(filter)"
    return
  }
  resultMatches.slice(0, 2)
  const mag =
    new Vec2(
      mapImgKeyPoints0[resultMatches[0].trainIdx].pt.x -
        mapImgKeyPoints0[resultMatches[1].trainIdx].pt.x,
      mapImgKeyPoints0[resultMatches[0].trainIdx].pt.y -
        mapImgKeyPoints0[resultMatches[1].trainIdx].pt.y
    ).norm() /
    new Vec2(
      targetImgKeyPoints[resultMatches[0].queryIdx].pt.x -
        targetImgKeyPoints[resultMatches[1].queryIdx].pt.x,
      targetImgKeyPoints[resultMatches[0].queryIdx].pt.y -
        targetImgKeyPoints[resultMatches[1].queryIdx].pt.y
    ).norm()

  const mapVec2 = new Vec2(
    210 - targetImgKeyPoints[resultMatches[0].queryIdx].pt.x,
    190 - targetImgKeyPoints[resultMatches[0].queryIdx].pt.y
  )
    .mul(mag)
    .add(
      new Vec2(
        mapImgKeyPoints0[resultMatches[0].trainIdx].pt.x,
        mapImgKeyPoints0[resultMatches[0].trainIdx].pt.y
      )
    )
  const { x, y } = mapVec2 as Vec2
  result = `center=${Math.floor((y - Number(process.argv[3])) * 100) / 100},${
    Math.floor((x - Number(process.argv[4])) * 100) / 100
  }`
}

const wss = new WebSocketServer({ port: 8080 })

wss.on('connection', function connection(ws) {
  setInterval(() => {
    void findMap()
    ws.send(result)
  }, 2000)
})

interface MinMatches {
  minDeg: number
  descriptorMatchsI: cv.DescriptorMatch
  descriptorMatchsJ?: cv.DescriptorMatch
}
