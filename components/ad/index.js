const app = getApp();

Component({
    properties: {},
    data: {
        type:Math.round(Math.random()*100),
        siteInfo:{},
    },
    lifetimes:{
        attached:function (){
            const root = this;
            this.setData({
                siteInfo:app.globalData.siteInfo
            });
            setInterval(()=>{
                root.setData({
                    type:Math.round(Math.random()*100),
                })
            },30e3);
        }
    },
    methods: {
        adError:function (e){
            console.log("add load error",e);
        }
    }
});
