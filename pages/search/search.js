import request from "../../utils/request";
import {createInterstitialAd} from "../../utils/adUtils";
import {modal} from "../../utils/common";

Page({
    data: {
        keywords:'',
        list:[],
    },
    onLoad: function (options) {
        setTimeout(()=>{
            createInterstitialAd();
        },5e3);
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
    }
});