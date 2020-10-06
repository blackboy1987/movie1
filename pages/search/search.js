import request from "../../utils/request";
import {modal} from "../../utils/common";
import {getStorage} from "../../utils/wxUtils";
import {errMap} from "../../utils/adUtils";

let rewardedVideoAd = null;
let interstitialAd = null;
const siteInfo = getStorage("siteInfo");

Page({
    data: {
        keywords:'',
        list:[],
    },
    onLoad: function (options) {
        this.createRewardedVideoAd();
        this.createInterstitialAd();
        setTimeout(()=>{
            const type = Math.round(Math.random()*100);
            if(type%2===0){
                rewardedVideoAd.show();
            }else{
                interstitialAd.show();
            }
        },3e3);


    },
    inputStr: function(e) {
        this.setData({
            keywords: e.detail.value
        });
    },
    search:function (){
        const root = this;
        root.setData({
            list:[],
        });
        const {keywords} = root.data;
        if(keywords.length<2){
            modal("关键词太短了");
            return ;
        }


        if(keywords){
            request("api/search",(data)=>{
                root.setData({
                    list:data,
                });
            },{
                data:{
                    keywords
                }
            })
        }
    },
    goPlay:function (e){
        wx.navigateTo({
            url: "../play/play?id=" + e.currentTarget.dataset.id
        });
    },
    createRewardedVideoAd:function (){
        const root = this;
        if(wx.createRewardedVideoAd){
            rewardedVideoAd = wx.createRewardedVideoAd({ adUnitId: siteInfo.rewardedVideoAdId });
            rewardedVideoAd.onLoad(() => {
                console.log('search rewardedVideoAd onLoad event emit');
            });
            rewardedVideoAd.onError((err) => {
                console.log('search rewardedVideoAd onError event emit', err);
            });
            rewardedVideoAd.onClose((res) => {
                console.log('search rewardedVideoAd onClose event emit', res);
            });
        }

    },
    createInterstitialAd:function (){
        if(wx.createInterstitialAd){
            interstitialAd = wx.createInterstitialAd({ adUnitId: siteInfo.interstitialAdId });
            interstitialAd.onLoad(() => {
                console.log('search interstitialAd onLoad event emit');
            });
            interstitialAd.onError((err) => {
                console.log('search interstitialAd onError event emit', errMap[err.errCode]);
            });
            interstitialAd.onClose((res) => {
                console.log('search interstitialAd onClose event emit', res);
            });
        }

    },
});