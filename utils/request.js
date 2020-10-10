import {Constants} from "./constants";
import {getStorage} from "./wxUtils";

const request = (url,callback,options={})=>{
    wx.showLoading({
        title:"数据加载中",
        mask:true,
    });

    if(!options){
        options = {};
    }
    const method = options.method || 'GET';
    const data = options.data || {};
    const userToken = getStorage("token");
    let header = {
        'content-type': 'application/json'
    };
    if (method==='POST'){
        header= {
            ...header,
            "content-type": "application/x-www-form-urlencoded",
        }
    }
    wx.request({
        url: Constants.baseUrl+url,
        method,
        data:{
            appCode:Constants.code,
            appSecret:Constants.secret,
            userToken,
            ...data,
        },
        header,
        success (res) {
            wx.hideLoading();
            const {statusCode} = res;
            if(statusCode>=200&&statusCode<=299){
                callback(res.data);
            }else {
                wx.showToast({
                    title:res.data.data.msg,
                    image:'/images/errorClick.png'
                });
            }
        },
        fail(err){
            wx.hideLoading();
            wx.showToast({
                title:err.errMsg,
                image:'/images/error.png'
            });
        }
    })
}

export default request;