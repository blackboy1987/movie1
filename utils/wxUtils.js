import request from "./request";

export const setStorage=(key,value)=>{
    wx.setStorageSync(key,value);
}

export const getStorage=(key)=>{
    return wx.getStorageSync(key);
}

export const wxGetSystemInfo=(callback)=>{
    wx.getSystemInfo({
        success:(result)=>{
            wx.setStorageSync("systemInfo",result);
            if(callback){
                callback(result);
            }
        }
    });
}

export const getUserInfo = (callback) =>{
    wx.getUserInfo({
        success:(data)=>{
            if(callback){
                callback(data);
            }
        }
    })
}