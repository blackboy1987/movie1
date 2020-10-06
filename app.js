
import {setStorage, wxGetSystemInfo} from "./utils/wxUtils";
import request from "./utils/request";

App({
  onLaunch: function () {
    const root = this;
    wx.login({
      success:(res)=>{
        const {code} = res;
        request('api/login',(data)=>{
          const {token} = data;
          setStorage("token",token);
        },{
          data:{
            code,
          }
        })
      }
    })
    request("api/site",(data)=>{
      root.globalData.siteInfo = data;
      setStorage("siteInfo",data);
    });

    wxGetSystemInfo((res)=>{
      setStorage("systemInfo",res);
    });

  },
  globalData: {
    userInfo: null,
    CustomBar:60,
    StatusBar:24,
  }
})