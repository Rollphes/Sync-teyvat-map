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
const child_process_1 = __importDefault(require("child_process"));
const electron_1 = require("electron");
const Log = __importStar(require("electron-log"));
const electron_updater_1 = require("electron-updater");
const homePath = __dirname.split('dist')[0];
const resourcesPath = homePath.split('app.asar')[0];
const server = child_process_1.default.fork(homePath + '/dist/server.js');
Log.transports.file.level = 'info';
electron_updater_1.autoUpdater.logger = Log;
process.on('uncaughtException', (err) => {
    Log.error(err);
    electron_1.app.quit();
});
if (require('electron-squirrel-startup') || !electron_1.app.requestSingleInstanceLock()) {
    electron_1.app.quit();
    process.exit();
}
const deploy = () => __awaiter(void 0, void 0, void 0, function* () {
    yield electron_1.session.defaultSession.loadExtension(resourcesPath + '/extensions', {
        allowFileAccess: true,
    });
    const win = new electron_1.BrowserWindow({
        show: false,
        title: `パイモンが地図動かしてくれるヤツ ver.${electron_1.app.getVersion()}`,
    });
    void win.loadURL('https://act.hoyolab.com/ys/app/interactive-map/index.html');
    win.on('ready-to-show', () => {
        win.show();
    });
    win.on('page-title-updated', (evt) => {
        evt.preventDefault();
    });
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (/rollphes/.exec(url)) {
            void electron_1.shell.openExternal(url);
            return {
                action: 'deny',
            };
        }
        return {
            action: 'allow',
        };
    });
    win.setMenu(null);
    //win.webContents.openDevTools()
    void electron_updater_1.autoUpdater.checkForUpdatesAndNotify();
    electron_updater_1.autoUpdater.on('update-downloaded', (info) => {
        void electron_1.dialog
            .showMessageBox(win, {
            type: 'info',
            buttons: ['更新して再起動', 'あとで'],
            message: 'アップデート',
            detail: '新しいバージョンをダウンロードしました。再起動して更新を適用しますか？',
        })
            .then((returnValue) => {
            if (returnValue.response === 0) {
                electron_updater_1.autoUpdater.quitAndInstall();
            }
        });
    });
});
electron_1.app.on('ready', () => {
    void deploy();
});
electron_1.app.on('browser-window-created', (e, win) => {
    win.on('page-title-updated', (evt) => {
        evt.preventDefault();
    });
    win.setMenu(null);
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
        server.kill();
    }
});
//# sourceMappingURL=index.js.map