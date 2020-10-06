import request from "../../utils/request";
import {getStorage, getUserInfo} from "../../utils/wxUtils";
import {errMap} from "../../utils/adUtils";
const siteInfo = getStorage("siteInfo");
let rewardedVideoAd = null;
let interstitialAd = null;

Page({
    data: {
        userInfo:{},
        show:false,
        records:[],
    },
    onLoad: function (options) {
        interstitialAd = this.createInterstitialAd();
        rewardedVideoAd = this.createRewardedVideoAd();
        this.load();
        this.record();
        setTimeout(()=>{
            interstitialAd.show();
        },3e3);
    },

    load:function (){
        const root = this;
        request("api/user",(data)=>{
            root.setData({
                userInfo:data,
            })
        });
    },
    bindInfo:function (){
      const {userInfo} = this.data;
      if(userInfo.isAuth){
          return;
      }
      this.showModal();
    },
    showModal: function() {
        this.setData({
            show:true
        });
    },
    hideModal: function() {
        this.setData({
            show:false
        });
    },
    authLogin: function(t) {
        const root = this;
        getUserInfo((data)=>{
            const userInfo = data.userInfo;
            if(data.errMsg==="getUserInfo:ok"){
                request('api/update',(data)=>{
                    root.setData({
                        userInfo:data,
                    })
                },{
                    data:userInfo,
                })
            }
        })
    },
    record: function(t) {
        const root = this;
        request('api/record_list',(data)=>{
            root.setData({
                records:data,
            })
        })
    },

    createRewardedVideoAd:function (){
        if(wx.createRewardedVideoAd){
            rewardedVideoAd = wx.createRewardedVideoAd({ adUnitId: siteInfo.rewardedVideoAdId });
            rewardedVideoAd.onLoad(() => {
                console.log('my rewardedVideoAd onLoad event emit');
            });
            rewardedVideoAd.onError((err) => {
                console.log('my rewardedVideoAd onError event emit', err);
            });
            rewardedVideoAd.onClose((res) => {
                console.log('my rewardedVideoAd onClose event emit', res);
            });
        }

    },
    createInterstitialAd:function (){
        if(wx.createInterstitialAd){
            interstitialAd = wx.createInterstitialAd({ adUnitId: siteInfo.interstitialAdId });
            interstitialAd.onLoad(() => {
                console.log('my interstitialAd onLoad event emit');
            });
            interstitialAd.onError((err) => {
                console.log('my interstitialAd onError event emit', errMap[err.errCode]);
            });
            interstitialAd.onClose((res) => {
                console.log('my interstitialAd onClose event emit', res);
            });
        }
    }
});