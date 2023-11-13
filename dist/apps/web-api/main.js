/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
const app_controller_1 = __webpack_require__(5);
const app_service_1 = __webpack_require__(6);
const audio_module_1 = __webpack_require__(7);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [audio_module_1.AudioModule],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);


/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
const app_service_1 = __webpack_require__(6);
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    getData() {
        return this.appService.getData();
    }
};
exports.AppController = AppController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "getData", null);
exports.AppController = AppController = tslib_1.__decorate([
    (0, common_1.Controller)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object])
], AppController);


/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
let AppService = class AppService {
    getData() {
        return { message: 'Hello API 1' };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], AppService);


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AudioModule = void 0;
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
const audio_service_1 = __webpack_require__(8);
const audio_controller_1 = __webpack_require__(12);
let AudioModule = class AudioModule {
};
exports.AudioModule = AudioModule;
exports.AudioModule = AudioModule = tslib_1.__decorate([
    (0, common_1.Module)({
        providers: [audio_service_1.AudioService],
        controllers: [audio_controller_1.AudioController],
    })
], AudioModule);


/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AudioService = void 0;
const tslib_1 = __webpack_require__(1);
// audio.service.ts
const common_1 = __webpack_require__(2);
const fluent_ffmpeg_1 = tslib_1.__importDefault(__webpack_require__(9));
const fs = tslib_1.__importStar(__webpack_require__(10));
const path = tslib_1.__importStar(__webpack_require__(11));
let AudioService = class AudioService {
    async getAudioSnippet() {
        const filePath = path.resolve('C:/Users/juanb/Documents/RADIO/radio-vlc/monitorear/2023/11/6/BlueRadio/BlueRadio_2023-11-06_16-03-30.463924.mp3');
        const outputPath = path.resolve('./output.mp3');
        // Get the duration of the audio file
        const duration = await new Promise((resolve, reject) => {
            fluent_ffmpeg_1.default.ffprobe(filePath, (err, metadata) => {
                if (err)
                    reject(err);
                else
                    resolve(metadata.format.duration);
            });
        });
        // Extract the last 30 seconds of the audio file
        await new Promise((resolve, reject) => {
            (0, fluent_ffmpeg_1.default)(filePath)
                .setStartTime(duration - 1800)
                .setDuration(1800)
                .audioBitrate(16) // Lower bitrate Reduce tamaño archivo
                .audioFrequency(8000) // Lower sample rate Reduce el tiempo
                .audioChannels(1) // Convert to mono
                .outputOptions('-preset ultrafast')
                .audioCodec('libmp3lame')
                .toFormat('mp3')
                .output(outputPath)
                .on('end', function () {
                const file = fs.createReadStream(outputPath);
                resolve(file);
            })
                .on('error', function (err) {
                console.log('An error occurred: ' + err.message);
                reject(err);
            })
                .run();
        });
        const stream = fs.createReadStream(outputPath);
        return stream;
    }
};
exports.AudioService = AudioService;
exports.AudioService = AudioService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], AudioService);


/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("fluent-ffmpeg");

/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 11 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AudioController = void 0;
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
const audio_service_1 = __webpack_require__(8);
const fastify_1 = __webpack_require__(13);
const perf_hooks_1 = __webpack_require__(14);
let AudioController = class AudioController {
    constructor(audioService) {
        this.audioService = audioService;
    }
    async getAudio(res) {
        try {
            const startTime = perf_hooks_1.performance.now();
            const file = await this.audioService.getAudioSnippet();
            const endTime = perf_hooks_1.performance.now();
            console.log(`Execution time: ${endTime - startTime} milliseconds`);
            res.header('Content-Type', 'audio/mpeg');
            res.send(file);
        }
        catch (err) {
            res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send({ error: err.message });
        }
    }
};
exports.AudioController = AudioController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__param(0, (0, common_1.Res)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_b = typeof fastify_1.FastifyReply !== "undefined" && fastify_1.FastifyReply) === "function" ? _b : Object]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], AudioController.prototype, "getAudio", null);
exports.AudioController = AudioController = tslib_1.__decorate([
    (0, common_1.Controller)('audio'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof audio_service_1.AudioService !== "undefined" && audio_service_1.AudioService) === "function" ? _a : Object])
], AudioController);


/***/ }),
/* 13 */
/***/ ((module) => {

module.exports = require("fastify");

/***/ }),
/* 14 */
/***/ ((module) => {

module.exports = require("perf_hooks");

/***/ }),
/* 15 */
/***/ ((module) => {

module.exports = require("@nestjs/platform-fastify");

/***/ }),
/* 16 */
/***/ ((module) => {

module.exports = require("@fastify/compress");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
const core_1 = __webpack_require__(3);
const app_module_1 = __webpack_require__(4);
const platform_fastify_1 = __webpack_require__(15);
const compress_1 = tslib_1.__importDefault(__webpack_require__(16));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_fastify_1.FastifyAdapter({ logger: true }));
    app.enableCors();
    app.register(compress_1.default);
    const globalPrefix = '';
    app.setGlobalPrefix(globalPrefix);
    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
    common_1.Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}
bootstrap();

})();

/******/ })()
;
//# sourceMappingURL=main.js.map