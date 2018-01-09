//'use strict';
//index.js
//获取应用实例
const app = getApp();
const recorderManager = wx.getRecorderManager();
const innerAudioContext = wx.createInnerAudioContext();
innerAudioContext.obeyMuteSwitch = false;
const options = {
  sampleRate: 16000,
  numberOfChannels: 1,
  format: 'mp3',
  frameSize: 64
};


Page({
  data: {
    text: 'Hello World',
    myopenid: '',
    recordingbool: false,
    isplay: false,
    sourcepath: '',
    resultpath: ''
  },
  //事件处理函
  onLoad: function () {
    if (wx.getStorageSync('MyOpenid').openid){
      this.setData({
        myopenid: wx.getStorageSync('MyOpenid').openid
      })
    }else{
      app.openidCallback = res => {
        this.setData({
          myopenid: res.openid
        })
      }
    }
    recorderManager.onStart(() => {
      var curP = getCurrentPages();
      var thisp = curP[curP.length - 1];
      thisp.setData({
        recordingbool: true
      });
      if (thisp.data.sourcepath != '') {
        wx.removeSavedFile({
          filePath: thisp.data.sourcepath
        });
        thisp.setData({
          sourcepath: ''
        });
      }
      if (thisp.data.resultpath != '') {
        wx.removeSavedFile({
          filePath: thisp.data.resultpath
        });
        thisp.setData({
          resultpath: ''
        });
      }
    });
    recorderManager.onStop((res) => {
      var curP = getCurrentPages();
      var thisp = curP[curP.length - 1];
      var tempFilePath = res.tempFilePath;
      thisp.setData({
        sourcepath: tempFilePath,
        recordingbool: false
      });
      console.log(tempFilePath);
      wx.getStorage({
        key: 'MyOpenid',
        success: res => {
          console.log(res.data);
          wx.uploadFile({
            url: 'https://234.collemt.club/onUpload',
            filePath: this.data.sourcepath,
            name: 'voices',
            formData: {
              openid: res.data
            },
            success: function (res2) {
              console.log(res2);
              thisp.setData({
                text:res2.data
              });
              
              // wx.downloadFile({
              //   url: 'https://234.collemt.club/server/audio/' + res.openid + '.mp3', 
              //   success: function (res3) {
              //     // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
              //     if (res3.statusCode === 200) {
              //       thisp.setData({
              //         resultpath: res3.tempFilePath
              //       })
              //     }
              //   }
              // });
            }
          });
          wx.downloadFile({
            url: 'https://234.collemt.club/oNGYI0fq7ewHsoUM_apTA9N0EmZ4.mp3',
            success: function (res3) {
              console.log(res3);
              if (res3.statusCode === 200) {
                wx.saveFile({
                  tempFilePath: res3.tempFilePath,
                  success: function(res4) {
                    thisp.setData({
                      resultpath: res4.savedFilePath
                    })
                  }
                })
              }
            },
            fail: function() {
              console.log('df');
            }
          });
          console.log('result',thisp.data.resultpath);
        }
      });

    });
    // recorderManager.onFrameRecorded((res) => {
    //   var curP = getCurrentPages();
    //   var thisp = curP[curP.length - 1];
    //   const { frameBuffer } = res;
    //   console.log('frameBuffer.byteLength', frameBuffer.byteLength);
    //   // var tempFilePath = res.tempFilePath;
    //   // thisp.setData({
    //   //   sourcepath: tempFilePath,
    //   //   recordingbool: false
    //   // });
    //   // console.log(tempFilePath);
    //   // wx.getStorage({
    //   //   key: 'MyOpenid',
    //   //   success: res => {
    //   //     console.log(res.data);
    //   //     wx.uploadFile({
    //   //       url: 'https://234.collemt.club/onUpload',
    //   //       filePath: this.data.sourcepath,
    //   //       name: 'voices',
    //   //       formData: {
    //   //         openid: res.data
    //   //       },
    //   //       success: function (res2) {
    //   //         console.log(res2);
    //   //         thisp.setData({
    //   //           text: res2.data
    //   //         })
    //   //       }
    //   //     });
    //   //   }
    //   // });
    // })
    // if (app.globalData.userInfo) {
    //   this.setData({
    //     userInfo: app.globalData.userInfo,
    //     hasUserInfo: true
    //   })
    // } else if (this.data.canIUse){
    //   // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    //   // 所以此处加入 callback 以防止这种情况
    //   app.userInfoReadyCallback = res => {
    //     this.setData({
    //       userInfo: res.userInfo,
    //       hasUserInfo: true
    //     })
    //   }
    // } else {
    //   // 在没有 open-type=getUserInfo 版本的兼容处理
    //   wx.getUserInfo({
    //     success: res => {
    //       app.globalData.userInfo = res.userInfo
    //       this.setData({
    //         userInfo: res.userInfo,
    //         hasUserInfo: true
    //       })
    //     }
    //   })
    // }
    innerAudioContext.onPlay(() => {
      var curP = getCurrentPages();
      var thisp = curP[curP.length - 1];
      thisp.setData({
        Isplay: true
      });
    });
    innerAudioContext.onStop(() => {
      var curP = getCurrentPages();
      var thisp = curP[curP.length - 1];
      thisp.setData({
        Isplay: false
      });
    });
    innerAudioContext.onEnded(() => {
      var curP = getCurrentPages();
      var thisp = curP[curP.length - 1];
      thisp.setData({
        Isplay: false
      });
    })
  },
  onRecord: function() {
    recorderManager.start(options);
  },
  onStop: function() {
    recorderManager.stop();
  },
  onvoiceplay: function() {
    if (this.data.resultpath != '') {
      innerAudioContext.src = this.dataresultpath;
      innerAudioContext.play();
    }
  },
  onvoicestop: function() {
    innerAudioContext.stop();
  }
})