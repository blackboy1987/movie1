
export const go=(url)=>{
    wx.navigateTo({
        url
    });
};

export const copy=(data,callback)=>{
    wx.setClipboardData({
        data,
        success: function() {
            if(callback){
                callback();
            }
        }
    });
}

export const modal = (title,callback) =>{
    wx.showModal({
        title: title,
        showCancel: true,
        cancelText: "取消",
        cancelColor: "#000000",
        confirmText: "确定",
        confirmColor: "#576B95",
        success (res) {
            if(callback){
                callback(res);
            }
        }
    });
}