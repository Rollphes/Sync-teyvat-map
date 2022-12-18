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
Object.defineProperty(exports, "__esModule", { value: true });
const cv = __importStar(require("@u4/opencv4nodejs"));
const fs = __importStar(require("fs"));
const homePath = __dirname.split('dist')[0];
const akaze = new cv.AKAZEDetector();
function createDatFile(name) {
    return __awaiter(this, void 0, void 0, function* () {
        const mapImg = yield cv.imreadAsync(homePath + `/img/${name}.png`, cv.IMREAD_GRAYSCALE);
        const mapImgKeyPoints = yield akaze.detectAsync(mapImg);
        const mapImgDescriptors = yield akaze.computeAsync(mapImg, mapImgKeyPoints);
        fs.writeFileSync(homePath + `/data/${name}ImgKeyPoints.dat`, JSON.stringify(mapImgKeyPoints), 'utf-8');
        fs.writeFileSync(homePath + `/data/${name}ImgDescriptors.dat`, JSON.stringify(mapImgDescriptors.getDataAsArray()), 'utf-8');
    });
}
function setup() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('[1/3]create map Data...');
        yield createDatFile(`map`);
        console.log('[2/3]create enkanomiya Data...');
        yield createDatFile(`enkanomiya`);
        console.log('[3/3]create sougan Data...');
        yield createDatFile(`sougan`);
        console.log('finish');
        process.exit();
    });
}
void setup();
//# sourceMappingURL=createDat.js.map