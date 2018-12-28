import Sharejs from './Sharejs';
import * as PIXI from 'pixi.js';
import Vconsole from 'vconsole';
import Loader from './Loader/Loader';

import Soundjs from './media/Soundjs';
import SoundMc from './media/SoundMc';
import Video from './media/Video';
import LoadingMc from './Loader/LoadingMc';
import Scene1 from './Scene/Scene1';

let app;
let stage;
let sound;
let soundMc;
let video;

let share = new Sharejs();
share.shareObj = {
    sharePath: location.href, //分享地址
    shareImg: "http://www.blueteapot.cn/tdh/h5Demo/images/myIcon.jpg", //分享图片
    shareTitle: 'h5 demo', //分享title
    shareDesc: "test" //分享描述
}
share.init();

//初始化背景音乐
initSound();

//初始化视频
initVideo();

//初始化pixi
initPixi();

var vconsole = new Vconsole();

//===============================初始化背景音乐==================================//
function initSound() {
    sound = new Soundjs('myMusic', true, true);
}

function soundMcIn() {
    soundMc = new SoundMc(sound);
    soundMc.init();
    app.stage.addChild(soundMc);
    soundMc.begin();
    soundMc.x = app.view.width - soundMc.wid - 50;
    soundMc.y = 50;
}

//================================初始化视频=====================================//
function initVideo() {
    video = new Video();
    video.emiter.on(video.VIDEO_PLAY, () => {
        console.log('event 视频开始播了');
        soundMc.mute();
    });
    video.emiter.on(video.VIDEO_END, () => {
        console.log('event 视频播完了');
        soundMc.unmute();
    });
}

//===============================初始化pixi======================================//
function initPixi() {
    const wid = window.innerWidth;
    const hei = window.innerHeight;

    app = new PIXI.Application(640, 640 / (wid / hei), {
        backgroundColor: 0x1099bb,
        preserveDrawingBuffer: true,
        antialias: true,
    });

    document.getElementById('pixiStage').appendChild(app.view);
    app.view.id = 'pixiCanvas';
    stage = new PIXI.Container();
    app.stage.addChild(stage);

    loading();
    start();
}

//=====================================loading部分==================================//
let loadingMc;

function loading() {
    //先加载加载界面
    let loading_asset = [
        {name: 'myIcon', url: './images/myIcon.jpg'}
    ];
    const loader = new Loader({manifest: loading_asset});
    loader.start();
    loader.on('onComplete', () => {
        loadingMc = new LoadingMc();
        stage.addChild(loadingMc);
        loadingMc.x = app.view.width / 2 - loadingMc.wid / 2;
        loadingMc.y = app.view.height / 2 - loadingMc.hei / 2;
        loadingMc.begin();

        loadMain(); //加载主资源
    });
}

let mainLoader;

function loadMain() {
    let loading_asset = [
        {name: 'assets', url: './images/assets.json'},
        {name: 'boss', url: './images/boss.png'}
    ];

    mainLoader = new Loader({manifest: loading_asset, easing: 0.1});
    mainLoader.start();
    mainLoader.on('onProgress', (pro) => {
        //console.log(pro);
        loadingMc.text.text = pro + '%';
    });
    mainLoader.on('onComplete', () => {
        mainLoader = null;
        stage.removeChild(loadingMc);
        loadingMc = null;

        soundMcIn();
        lunchIn();
    });
}

//==============================lunch部分=======================
let lunch;

function lunchIn() {
    lunch = new Scene1(app);
    lunch.init();
    stage.addChild(lunch);
    lunch.x = app.view.width / 2 - lunch.wid / 2;
    lunch.y = app.view.height / 2 - lunch.hei / 2;
    lunch.begin();
    lunch.on(lunch.SCENE_IN, () => {
        console.log('lunch in');
    });

    lunch.on(lunch.VIDEO_PLAY, () => {
        video.playVideo();
    });
}

function update() {
    if (mainLoader) mainLoader.update();
}

function start() {
    requestAnimationFrame(start);
    update();
}