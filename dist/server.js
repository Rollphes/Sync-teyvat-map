"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cv = __importStar(require("@u4/opencv4nodejs"));
const opencv4nodejs_1 = require("@u4/opencv4nodejs");
const fs = __importStar(require("fs"));
const screenshot_desktop_1 = __importDefault(require("screenshot-desktop"));
const ws_1 = require("ws");
const akaze = new opencv4nodejs_1.AKAZEDetector();
const homePath = __dirname.split('dist')[0];
const resourcesPath = homePath.split('app.asar')[0];
const wss = new ws_1.WebSocketServer({ port: 27900 });
const dimensions = {
    2: {
        name: 'map',
        x: 7002,
        y: 1126,
    },
    7: {
        name: 'enkanomiya',
        x: 1861,
        y: 1783,
    },
    9: {
        name: 'sougan',
        x: 2027,
        y: 1958,
    },
};
let clientDimension = '2';
const findMap = (dimension) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, screenshot_desktop_1.default)({ filename: resourcesPath + '/img/t.png' });
    const targetImgOri = yield cv.imreadAsync(resourcesPath + '/img/t.png', cv.IMREAD_GRAYSCALE);
    const region = new cv.Rect(Math.floor(targetImgOri.cols * 0.03125), Math.floor(targetImgOri.rows * 0.01851), Math.floor(targetImgOri.cols * 0.10937), Math.floor(targetImgOri.cols * 0.10937));
    const targetImg = targetImgOri.getRegion(region).resize(600, 600);
    const targetImgKeyPoints = yield akaze.detectAsync(targetImg);
    const targetImgDescriptors = yield akaze.computeAsync(targetImg, targetImgKeyPoints);
    const mapImgKeyPoints0 = JSON.parse(fs.readFileSync(resourcesPath + `/data/${dimension.name}ImgKeyPoints.dat`, 'utf-8')).map((key) => new cv.KeyPoint(new cv.Point2(key.pt.x, key.pt.y), key.size, key.angle, key.response, key.octave, key.class_id));
    const mapImgDescriptors0 = new cv.Mat(JSON.parse(fs.readFileSync(resourcesPath + `/data/${dimension.name}ImgDescriptors.dat`, 'utf-8')), 0);
    const bf = new cv.BFMatcher(cv.NORM_HAMMING2);
    const matches = bf.match(targetImgDescriptors, mapImgDescriptors0);
    if (matches.length === 0)
        return;
    const bestN = 40;
    const bestMatches = matches
        .sort((match1, match2) => match1.distance - match2.distance)
        .slice(0, bestN);
    const resultMatches = [];
    for (let i = 0; i < bestMatches.length - 1; i++) {
        const minMatches = {
            minDeg: 360,
            descriptorMatchsI: bestMatches[i],
        };
        for (let j = i + 1; j < bestMatches.length; j++) {
            if (i == j)
                continue;
            const mapRad = Math.atan((mapImgKeyPoints0[bestMatches[i].trainIdx].pt.y -
                mapImgKeyPoints0[bestMatches[j].trainIdx].pt.y) /
                (mapImgKeyPoints0[bestMatches[i].trainIdx].pt.x -
                    mapImgKeyPoints0[bestMatches[j].trainIdx].pt.x));
            const targetRad = Math.atan((targetImgKeyPoints[bestMatches[i].queryIdx].pt.y -
                targetImgKeyPoints[bestMatches[j].queryIdx].pt.y) /
                (targetImgKeyPoints[bestMatches[i].queryIdx].pt.x -
                    targetImgKeyPoints[bestMatches[j].queryIdx].pt.x));
            let mapDeg = (mapRad * (180 / Math.PI)) % 360;
            let targetDeg = (targetRad * (180 / Math.PI)) % 360;
            mapDeg = mapDeg < 0 ? 360 + mapDeg : mapDeg;
            targetDeg = targetDeg < 0 ? 360 + targetDeg : targetDeg;
            const diffDeg = Math.abs(mapDeg - targetDeg);
            if (isNaN(diffDeg))
                continue;
            if (minMatches.minDeg > diffDeg) {
                minMatches.descriptorMatchsJ = bestMatches[j];
                minMatches.minDeg = diffDeg;
            }
        }
        if (minMatches.minDeg > 0.1 || minMatches.descriptorMatchsI.distance > 50)
            continue;
        resultMatches.push(minMatches.descriptorMatchsI);
        if (minMatches.descriptorMatchsJ === undefined ||
            minMatches.descriptorMatchsJ.distance > 50)
            continue;
        resultMatches.push(minMatches.descriptorMatchsJ);
    }
    if (resultMatches.length < 2)
        return;
    resultMatches.slice(0, 2);
    const mag = new opencv4nodejs_1.Vec2(mapImgKeyPoints0[resultMatches[0].trainIdx].pt.x -
        mapImgKeyPoints0[resultMatches[1].trainIdx].pt.x, mapImgKeyPoints0[resultMatches[0].trainIdx].pt.y -
        mapImgKeyPoints0[resultMatches[1].trainIdx].pt.y).norm() /
        new opencv4nodejs_1.Vec2(targetImgKeyPoints[resultMatches[0].queryIdx].pt.x -
            targetImgKeyPoints[resultMatches[1].queryIdx].pt.x, targetImgKeyPoints[resultMatches[0].queryIdx].pt.y -
            targetImgKeyPoints[resultMatches[1].queryIdx].pt.y).norm();
    const mapVec2 = new opencv4nodejs_1.Vec2(300 - targetImgKeyPoints[resultMatches[0].queryIdx].pt.x, 300 - targetImgKeyPoints[resultMatches[0].queryIdx].pt.y)
        .mul(mag)
        .add(new opencv4nodejs_1.Vec2(mapImgKeyPoints0[resultMatches[0].trainIdx].pt.x, mapImgKeyPoints0[resultMatches[0].trainIdx].pt.y));
    const { x, y } = mapVec2;
    return `center=${Math.floor((y - dimension.y) * 100) / 100},${Math.floor((x - dimension.x) * 100) / 100}`;
});
const sendClient = (ws, dimension) => __awaiter(void 0, void 0, void 0, function* () {
    const center = yield findMap(dimension).catch((e) => { });
    if (!center)
        return;
    ws.send(center);
});
wss.on('connection', (ws) => {
    ws.on('message', (e) => {
        clientDimension = e.toString();
        void sendClient(ws, dimensions[+clientDimension]);
    });
});
//# sourceMappingURL=server.js.map