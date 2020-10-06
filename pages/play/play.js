import request from "../../utils/request";
import {errMap} from "../../utils/adUtils";
import {modal} from "../../utils/common";
import {getStorage, setStorage} from "../../utils/wxUtils";
const util = require('../../utils/util.js');

let video = null;
const app = getApp();
let rewardedVideoAd = null;
let interstitialAd = null;
let count = 0;
let timer = null;
let start = new Date();
let end = new Date();
const siteInfo = getStorage("siteInfo");

Page({
    data: {
        is_share:true,
        videoInfo:{},
        rateIndex: 2,
        rate: [ .5, .8, 1, 1.25, 1.5, 2 ],
        siteInfo:app.globalData.siteInfo,
        currentPlayUrl:'',
        currentPlayUrlKey:'0_0',
        currentTitle:'',
        isAd:false,
    },
    onLoad: function (options) {
        const root = this;
        request("api/site",(data)=>{
            root.countDown();
            root.setData({
                siteInfo:data,
            })
        })
        const {id} = options;
        if(id){
         this.loadDetail(id);
        }
        this.createRewardedVideoAd();
        this.createInterstitialAd();
        this.addRecord(id);
    },
    loadDetail(id){
        const root = this;
        request('api/info',(data)=>{
            const {playUrls} = data;
            const url = playUrls.length>0&&playUrls[0].urls[0];
            const urls = (url||'').split("http");
            // 解析第一个播放地址
            root.setData({
                videoInfo:data,
                currentPlayUrlKey:'0_0',
                currentPlayUrl:"http"+urls[1],
                currentTitle:urls[0].substr(0,urls[0].length-1),
            });
            video = wx.createVideoContext("myVideo");
        },{
            data:{
                id,
            },
        })
    },
    onPlay(e){
        const root = this;
        const {isAd} = root.data;
        if(!isAd){
            modal("观看完广告即可继续观看哦!",(res)=>{
                video.pause();
                if (res.confirm) {
                    root.setData({
                        isAd:true,
                    });
                    rewardedVideoAd.show();
                }
            })
        }
    },
    onError(e){
        setStorage("count",0);
        clearInterval(timer);
        wx.showToast({
            title:'该线路资源不稳定，试着切换一下线路吧!',
        })
    },
    onEnd(e){
        clearInterval(timer);
        console.log("onEnd",e);
    },
    onTimeUpdate(e){

    },
    onWaiting(e){
        console.log("onWaiting",e);
    },
    loadedmetadata(e){

    },
    inPause(e){
        console.log("inPause",e);
    },
    rateChange(a){
        const {rate} = this.data;
        this.setData({
            rateIndex: a.detail.value,
        });
        video.playbackRate(rate[a.detail.value]);
    },
    onShareAppMessage: function() {
        const root = this;
        const {videoInfo} = root.data
        return {
            title: videoInfo.title,
            path: "/pages/play/play?id=" + videoInfo.id + "&is_share=1",
            imageUrl: videoInfo.img
        };
    },
    kefu:function (){
        const {videoInfo} = this.data;
        let a = [];
        a.push(videoInfo.img);
        wx.previewImage({
            current: a[0],
            urls: a
        });
    },
    setUrl:function (e){
        const {index,url} = e.currentTarget.dataset;
        const urls = (url||'').split("http");
        this.setData({
            isAd:false,
            currentPlayUrlKey:index,
            currentPlayUrl:"http"+urls[1],
            currentTitle:urls[0].substr(0,urls[0].length-1),
        })

    },
    countDown:function (){
        start = new Date();
        count = getStorage("count") || 0;
        // 根据留存时间来计算观影时长
        timer = setInterval(()=>{
            count +=1;
        },1e3);
        // 超过一个小时才统计
    },
    onHide:function (e){
        this.sendCount();
    },
    onUnload:function (e){
        this.sendCount();
    },
    sendCount:function (){
        /*if(!siteInfo.openPoint || siteInfo.minVisitMinute*60>point){
            wx.showToast({
                title:"本次观影时长不足："+siteInfo.minVisitMinute+"分钟，无法获取奖励",
            })
            return ;
        }*/
        const {currentPlayUrlKey,videoInfo} = this.data;
        end = new Date();
        setStorage("count",count);
        clearInterval(timer);
        // 接口返回成功，将count 清0
        request("api/update_time",(data)=>{
            setStorage("count",0);
        },{
            data:{
                end:util.formatTime(end),
                start:util.formatTime(start),
                playUrlKey:currentPlayUrlKey,
                videoId:videoInfo.id
            }
        })
    },
    createRewardedVideoAd:function (){
        const root = this;
        if(wx.createRewardedVideoAd){
            rewardedVideoAd = wx.createRewardedVideoAd({ adUnitId: siteInfo.rewardedVideoAdId });
            rewardedVideoAd.onLoad(() => {
                console.log('play rewardedVideoAd onLoad event emit');
            });
            rewardedVideoAd.onError((err) => {
                if(video.pause){
                    video.play();
                }
                console.log('play rewardedVideoAd onError event emit', err);
            });
            rewardedVideoAd.onClose((res) => {
                const {isEnded} = res;
                if(isEnded){
                    root.setData({
                        isAd:true
                    });
                }else{
                    // 扣除积分。如果积分不够，视频暂停
                    this.adjustPoint(-100);
                }

                console.log('play rewardedVideoAd onClose event emit', res);
            });
        }

    },
    createInterstitialAd:function (){
        if(wx.createInterstitialAd){
            interstitialAd = wx.createInterstitialAd({ adUnitId: siteInfo.interstitialAdId });
            interstitialAd.onLoad(() => {
                console.log('play interstitialAd onLoad event emit');
            });
            interstitialAd.onError((err) => {
                if(video.pause){
                    video.play();
                }
                console.log('play interstitialAd onError event emit', errMap[err.errCode]);
            });
            interstitialAd.onClose((res) => {
                console.log('play interstitialAd onClose event emit', res);
            });
        }

    },
    adjustPoint:function (point){
        request('api/adjust',(data)=>{
        },{
            data:{
                point,
                memo:'跳过广告'
            }
        })
    },
    addRecord:function (id){
        request('api/record',(data)=>{
        },{
            data:{
                videoId:id
            }
        })
    }
});