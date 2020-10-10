import {getStorage} from "./wxUtils";

export const errMap = {
    1000:"后端接口调用失败",
    1001:"参数错误",
    1002:"广告单元无效",
    1003:"内部错误",
    1004:"无合适的广告",
    1005:"广告组件审核中",
    1006:"广告组件被驳回",
    1007:"广告组件被封禁",
    1008:"广告单元已关闭",
}


export const createRewardedVideoAd=function (funcs){
    const siteInfo = getStorage("siteInfo");
    if(wx.createRewardedVideoAd){
        const rewardedVideoAd = wx.createRewardedVideoAd({ adUnitId: siteInfo.rewardedVideoAdId });
        rewardedVideoAd.onLoad(() => {
            if(funcs.onLoad){
                funcs.onLoad();
            }
        });
        rewardedVideoAd.onError((err) => {
            if(funcs.onError){
                funcs.onError(err);
            }
        });
        rewardedVideoAd.onClose((res) => {
            if(funcs.onClose){
                funcs.onClose(res);
            }
        });
        return rewardedVideoAd;
    }
    return null;

}

export const createInterstitialAd=function (func){
    const siteInfo = getStorage("siteInfo");
    if(wx.createInterstitialAd){
        const interstitialAd = wx.createInterstitialAd({ adUnitId: siteInfo.interstitialAdId });
        interstitialAd.onLoad(() => {
            if(func.onLoad){
                func.onLoad();
            }
        });
        interstitialAd.onError((err) => {
            if(func.onError){
                func.onError(err);
            }
        });
        interstitialAd.onClose((res) => {
            if(func.onClose){
                func.onClose(res);
            }
        });

        return interstitialAd;
    }
}
