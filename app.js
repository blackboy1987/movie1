
import {setStorage, wxGetSystemInfo} from "./utils/wxUtils";
import request from "./utils/request";

App({
  onLaunch: function (e) {
    const root = this;
    wx.login({
      success:(res)=>{
        const {code} = res;
        request('api/login',(result)=>{
          const {data} = result;
          const {token,id} = data;
          setStorage("userId",id);
          setStorage("token",token);
        },{
          data:{
            code,
          }
        })
      }
    })
    request("api/site",(result)=>{
      const {data} = result;
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
    siteInfo:{},
  }
})