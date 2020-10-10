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
        type:Math.round(Math.random()*100),
        danMuList:[],
    },
    onLoad: function (options) {
        console.log("play.js",options);
        this.dealShareInfo(options);
        const root = this;
        request("api/site",(result)=>{
            const {data} = result;
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
        request('api/info',(result)=>{
            const {data} = result
            const {playUrls} = data;
            const url = playUrls.length>0&&playUrls[0].urls[0];
            const urls = (url||'').split("@@@");
            // 解析第一个播放地址
            root.setData({
                videoInfo:data,
                currentPlayUrlKey:'0_0',
                currentPlayUrl:urls[1],
                currentTitle:data.title+" "+urls[0],
            });
            root.getDanMu(data.id,'0_0');
            video = wx.createVideoContext("myVideo");
        },{
            data:{
                id,
            },
        })
    },
    onPlay(e){
        const root = this;
        root.countDown();
        const {isAd} = root.data;
        if(!isAd){
            modal("观看完广告即可继续观看哦!",(res)=>{
                if(video){
                    root.videoPause();
                }
                if (res.confirm) {
                    rewardedVideoAd.show().catch(() => {
                        rewardedVideoAd.load().then(() => rewardedVideoAd.show()).catch(err => {
                            console.log('激励视频 广告显示失败');
                            if(video.pause){
                                wx.showToast({
                                    title:'系统已自动为您跳过广告',
                                    icon:'none',
                                })
                                root.videoPlay();
                                root.setData({
                                    isAd:true,
                                })
                            }
                        });
                    });
                }else{
                    this.adjustPoint(-100,"看视频跳过广告");
                }
            })
        }
    },
    onError(e){
        setStorage("count",0);
        this.stopCountDown();
        wx.showToast({
            title:'资源加载失败，请切换其他线路',
            icon:'none',
        });
        console.log(e,"load error");
    },
    onEnd(e){
        const root = this;
        root.stopCountDown();
        /**
         * currentPlayUrlKey:'0_0',
         currentPlayUrl:urls[1],
         currentTitle:videoInfo.title+" "+urls[0],
         */
        const {currentPlayUrlKey,videoInfo,currentPlayUrl,currentTitle} = this.data;
        // 通过currentPlayUrlKey解析出来播放的是第几条线路和第机集。
        const {playUrls} = videoInfo;
        const currents = currentPlayUrlKey.split("_");
        const xianLu = currents[0];
        const jiShu = currents[1];
        const currentXianLu = playUrls[xianLu];
        const index = parseInt(jiShu,10)+1;
        if(index<currentXianLu.urls.length){
            const url = currentXianLu.urls[index];
            const urls = (url||'').split("@@@");
            root.setData({
                isAd:false,
                currentPlayUrlKey:xianLu+'_'+(parseInt(jiShu,10)+1),
                currentPlayUrl:urls[1],
                currentTitle:videoInfo.title+" "+urls[0],
            });
            if(video){
                root.videoPlay();
            }
        }
        console.log("onEnd",e);
    },
    onTimeUpdate(e){

    },
    onWaiting(e){
        this.stopCountDown();
    },
    loadedmetadata(e){
        console.log("load",e);
    },
    inPause(e){
        this.stopCountDown();
        console.log("inPause",e);
    },
    rateChange(a){
        const {rate} = this.data;
        this.setData({
            rateIndex: a.detail.value,
        });
        if(video){
            video.playbackRate(rate[a.detail.value]);
        }
    },
    videoPlay:function (){
        const {rateIndex,rate} = this.data;
        if(video){
            video.playbackRate(rate[rateIndex]);
            video.play();
        }
    },
    videoPause:function (){
        if(video){
            video.pause();
        }
    },

    // 分享详情页面
    onShareAppMessage: function() {
        const root = this;
        const {videoInfo} = root.data
        return {
            title: videoInfo.title,
            path: "/pages/play/play?id=" + videoInfo.id + "&type=1&parentId="+2,
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
        const {videoInfo} = this.data;
        this.stopCountDown();
        const {index,url} = e.currentTarget.dataset;
        const urls = (url||'').split("@@@");
        this.setData({
            isAd:false,
            currentPlayUrlKey:index,
            currentPlayUrl:urls[1],
            currentTitle:videoInfo.title+" "+urls[0],
        });
        this.getDanMu(videoInfo.id,index);
        this.videoPlay();

    },

    getDanMu:function (id,key){
        console.log(id,key);
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

    stopCountDown:function (){
        clearInterval(timer);
    },
    onHide:function (e){
        this.stopCountDown();
        this.sendCount();
    },
    onUnload:function (e){
        this.stopCountDown();
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
        request("api/update_time",(result)=>{
            const {data} = result;
            setStorage("count",0);
        },{
            data:{
                end:util.formatTime(end),
                start:util.formatTime(start),
                playUrlKey:currentPlayUrlKey,
                videoId:videoInfo.id,
                count,
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
                    root.videoPlay();
                }
                console.log('play rewardedVideoAd onError event emit', err);
            });
            rewardedVideoAd.onClose((res) => {
                const {isEnded} = res;
                if(isEnded){
                    root.setData({
                        isAd:true
                    });
                    root.videoPlay();
                }else{
                    // 扣除积分。如果积分不够，视频暂停
                    this.adjustPoint(-100,"看视频跳过广告");
                }
                console.log('play rewardedVideoAd onClose event emit', res);
            });
        }

    },
    createInterstitialAd:function (){
        const root = this;
        if(wx.createInterstitialAd){
            interstitialAd = wx.createInterstitialAd({ adUnitId: siteInfo.interstitialAdId });
            interstitialAd.onLoad(() => {
                console.log('play interstitialAd onLoad event emit');
            });
            interstitialAd.onError((err) => {
                if(video&&video.pause){
                    root.videoPlay();
                }
                console.log('play interstitialAd onError event emit', errMap[err.errCode]);
            });
            interstitialAd.onClose((res) => {
                console.log('play interstitialAd onClose event emit', res);
            });
        }

    },
    adjustPoint:function (point,memo){
        const root = this;
        request('api/adjust',(result)=>{
            const {code,msg} = result;
            console.log("adjust",result);
            if(code===-1){
                wx.showToast({
                    title:msg,
                    icon:'none',
                });
                if(video){
                    root.videoPause();
                    root.setData({
                        isAd:false,
                    })
                }
            }


        },{
            data:{
                point,
                memo,
            }
        })
    },
    addRecord:function (id){
        request('api/record',(result)=>{
            const {data} = result;
        },{
            data:{
                videoId:id
            }
        })
    },
    adError:function (e){
        console.log("add load error",e);
    },
    dealShareInfo:function (e){
        const {parentId} = e;
        if(parentId){
            request("api/tuijian",(data)=>{
            },{
                data:{
                    parentId:2,
                    token:getStorage("token"),
                }
            })
        }
    }
});