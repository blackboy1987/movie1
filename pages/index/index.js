//index.js
//获取应用实例
import request from "../../utils/request";
import {getStorage} from "../../utils/wxUtils";
import {errMap} from "../../utils/adUtils";

let rewardedVideoAd = null;
let interstitialAd = null;
const app = getApp()

Page({
  data: {
    systemInfo: getStorage("systemInfo"),
    siteInfo:getStorage("siteInfo"),
    navData:[],
    currentTabId:0,
    currentSwiper:0,
    indexList:{
      hotMovies:[],
      hottv:[],
      news:[],
    },
    list:{},
    adPosition:Math.round(Math.random()*15),
  },

  getNavData(){
    const root = this;
    request("api/categories",(data)=>{
      root.setData({
        navData:[
          ...data,
        ]
      })
    })
  },
  onLoad: function () {
    interstitialAd = this.createInterstitialAd();
    rewardedVideoAd = this.createRewardedVideoAd();
    const root = this;
    root.getNavData();
    root.list('');
    root.setData({
      CustomBar: app.globalData.CustomBar
    });
    setTimeout(function() {
      if(interstitialAd){
        interstitialAd.show();
      }
    }, 15e3);
    if(rewardedVideoAd){
      rewardedVideoAd.show();
    }
  },
  tabSelect(e){
    const {id,index} = e.target.dataset;
    const {systemInfo} = this.data;
    const singleNavWidth = systemInfo.windowWidth / 5;
    this.setData({
      currentTabId:id,
      navScrollLeft:(index - 2) * singleNavWidth,
      currentSwiper:index,
    });
    this.list(id===0 ? '' : id);
  },
  cardSwiper(e){
    const {current,source} = e.detail;
    if(source!=='touch'){
      return ;
    }
    const {systemInfo,navData} = this.data;
    const singleNavWidth = systemInfo.windowWidth / 5;
    this.setData({
      currentTabId:current===0?'':navData[current-1].id,
      navScrollLeft:(current - 2) * singleNavWidth,
      currentSwiper:current,
    });
    this.list(current===0?0:navData[current-1].id);
  },
  list(categoryId){
    const root = this;
    request("api/list",(data)=>{
      if(!categoryId){
        root.setData({
          indexList:data,
        })
      }else{
        root.setData({
          list:{
            [categoryId]:data
          }
        })
      }

    },{
      data:{
        categoryId:categoryId&&categoryId!==0?categoryId:'',
        pageNumber:1
      }
    });
  },
  gotPlay(e){
    const {id} = e.currentTarget.dataset;
    if(id){
      wx.navigateTo({
        url: "../play/play?id=" + id
      });
    }
  },
  adLoad: function(t) {
    console.log("add adLoad",t);
  },
  adClose: function(t) {
    console.log("add adClose",t);
  },
  adError: function(t) {
    console.log("add error",errMap[t.errCode]);
  },
  createRewardedVideoAd:function (){
    const {siteInfo} = app.globalData;
    console.log(siteInfo,app.globalData);
    if(wx.createRewardedVideoAd){
      rewardedVideoAd = wx.createRewardedVideoAd({ adUnitId: siteInfo.rewardedVideoAdId });
      rewardedVideoAd.onLoad(() => {
        console.log('index rewardedVideoAd onLoad event emit');
      });
      rewardedVideoAd.onError((err) => {
        console.log('index rewardedVideoAd onError event emit', err);
      });
      rewardedVideoAd.onClose((res) => {
        console.log('index rewardedVideoAd onClose event emit', res);
      });
    }

  },
  createInterstitialAd:function (){
    const {siteInfo} = app.globalData;
    console.log(siteInfo,app.globalData);
    if(wx.createInterstitialAd){
      interstitialAd = wx.createInterstitialAd({ adUnitId: siteInfo.interstitialAdId });
      interstitialAd.onLoad(() => {
        console.log('index interstitialAd onLoad event emit');
      });
      interstitialAd.onError((err) => {
        console.log('index interstitialAd onError event emit', errMap[err.errCode]);
      });
      interstitialAd.onClose((res) => {
        console.log('index interstitialAd onClose event emit', res);
      });
    }
  },
  onShareAppMessage: function() {
    const {siteInfo} = app.globalData;
    return {
      title: siteInfo.name,
      path: "/pages/index/index",
      imageUrl: siteInfo.logo || '',
    };
  },
})
