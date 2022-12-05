import * as fs from 'fs'
import * as cv from 'opencv4nodejs'
const akaze = new cv.AKAZEDetector()
async function createDatFile(name: string) {
  const mapImg = await cv.imreadAsync(
    `${__dirname}/${name}.png`,
    cv.IMREAD_GRAYSCALE
  )
  const mapImgKeyPoints = await akaze.detectAsync(mapImg)
  const mapImgDescriptors = await akaze.computeAsync(mapImg, mapImgKeyPoints)
  fs.writeFileSync(
    `${name}ImgKeyPoints.dat`,
    JSON.stringify(mapImgKeyPoints),
    'utf-8'
  )
  fs.writeFileSync(
    `${name}ImgDescriptors.dat`,
    JSON.stringify(mapImgDescriptors.getDataAsArray()),
    'utf-8'
  )
}
async function setup() {
  console.log('[1/3]create map Data...')
  await createDatFile(`map`)
  console.log('[2/3]create enkanomiya Data...')
  await createDatFile(`enkanomiya`)
  console.log('[3/3]create sougan Data...')
  await createDatFile(`sougan`)
  console.log('finish')
}
void setup()
