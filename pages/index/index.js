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
    lan: '中文',
    languages: ['中文', 'English'],
    lanIndex: 0,
    text: {
      lan: 'language',
      prevtext: '欢迎使用语音翻译',
      sourcetext: '欢迎使用语音翻译',
      resulttext: 'Welcome to use SpeechMT',
      src: '中文',
      res: '英文',
      play: '播放',
      stop: '停止',
      recordtxt: '按住来翻译',
      autoplay: '自动播放',
      translating: '翻译中',
      downloading: '下载音频中',
    },
    zh: {
      lan: 'language',
      prevtext: '欢迎使用语音翻译',
      sourcetext: '欢迎使用语音翻译',
      resulttext: 'Welcome to use SpeechMT',
      src: '中文',
      res: '英文',
      play: '播放',
      stop: '停止',
      recordtxt: '按住来翻译',
      autoplay: '自动播放',
      translating: '翻译中',
      downloading: '下载音频中',
    },
    en: {
      lan: 'language',
      prevtext: 'Welcome to use SpeechMT',
      sourcetext: 'Welcome to use SpeechMT',
      resulttext: '欢迎使用语音翻译',
      src: 'English',
      res: 'Chinese',
      play: 'play',
      stop: 'stop',
      recordtxt: 'hold to interpret',
      autoplay: 'Autoplay',
      translating: 'translating',
      downloading: 'downloading',
    },
    myopenid: '',
    recordingbool: false,
    isplay: false,
    sourcepath: '',
    resultpath: '',
    logourl: '../../images/logo3.png',
    logourl1: '../../images/logo4.png',
    playurl: '../../images/music03.png',
    stopurl: '../../images/music09.png',
    autoplay: true
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
        recordingbool: true,
        logourl: '../../images/logo4.png'
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
          resultpath: ' '
        });
      }
    });
    recorderManager.onStop((res) => {
     
      var curP = getCurrentPages();
      var thisp = curP[curP.length - 1];
      wx.showLoading({
        title: thisp.data.text.translating,
      })
      var tempFilePath = res.tempFilePath;
      thisp.setData({
        sourcepath: tempFilePath,
        recordingbool: false,
        logourl: '../../images/logo3.png'
      });
      console.log(tempFilePath);
      wx.getStorage({
        key: 'MyOpenid',
        success: res => {
          console.log(res.data);
          wx.uploadFile({
            url: 'https://234.collemt.club:3891/onUpload',
            filePath: this.data.sourcepath,
            name: 'voices',
            formData: {
              openid: res.data,
            },
            success: function (res2) {
              wx.hideLoading();
              console.log(res2);
              var data = JSON.parse(res2.data);
              thisp.setData({
                'text.prevtext':data.zh,
                'text.sourcetext':data.zh,
                'text.resulttext':data.en
              });
              wx.showLoading({
                title: thisp.data.text.downloading,
              })
              wx.downloadFile({
                url: 'https://234.collemt.club:3891/onFetch/' + res.data + '.mp3',
                success: function (res3) {
                  // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
                  if (res3.statusCode == 200) {
                    
                    wx.saveFile({
                      tempFilePath: res3.tempFilePath,
                      success: function (res4) {
                        thisp.setData({
                          resultpath: res4.savedFilePath
                        });
                        console.log(thisp.data.resultpath);
                        if (thisp.data.autoplay)
                          thisp.onvoiceplay();
                      }
                    });
                    wx.hideLoading();
                    
                  }
                }
              });
            }
          });
          // wx.downloadFile({
          //   url: 'https://234.collemt.club/oNGYI0fq7ewHsoUM_apTA9N0EmZ4.mp3',
          //   success: function (res3) {
          //     console.log(res3);
          //     if (res3.statusCode === 200) {
          //       wx.saveFile({
          //         tempFilePath: res3.tempFilePath,
          //         success: function(res4) {
          //           thisp.setData({
          //             resultpath: res4.savedFilePath
          //           })
          //         }
          //       })
          //     }
          //   },
          //   fail: function() {
          //     console.log('df');
          //   }
          // });
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
        isplay: true
      });
    });
    innerAudioContext.onStop(() => {
      var curP = getCurrentPages();
      var thisp = curP[curP.length - 1];
      thisp.setData({
        isplay: false
      });
    });
    innerAudioContext.onEnded(() => {
      var curP = getCurrentPages();
      var thisp = curP[curP.length - 1];
      thisp.setData({
        isplay: false
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
      innerAudioContext.src = this.data.resultpath;
      innerAudioContext.play();
    }
  },
  onvoicestop: function() {
    innerAudioContext.stop();
  },
  switchChange: function() {
    this.setData({
      autoplay: !this.data.autoplay
    });
    console.log(this.data.autoplay);
  },
  textareaconfirm: function(e) {
    var txt = e.detail.value;
    //TODO: 
    console.log(txt);
    if (txt != this.data.text.prevtext) {
      this.setData({
        'text.prevtext': txt
      })
      wx.showLoading({
        title: this.data.text.translating,
      })
      wx.getStorage({
        key: 'MyOpenid',
        success: function (res) {
          var curP = getCurrentPages();
          var thisp = curP[curP.length - 1];
          wx.request({
            url: 'https://234.collemt.club:3891/onEdit',
            data: {
              openid: res.data,
              text: txt
            },
            success: function (res2) {
              wx.hideLoading();
              console.log(res2.data);
              var data = res2.data;
              thisp.setData({
                'text.resulttext': data.en
              });
              wx.showLoading({
                title: this.data.text.downloading,
              })
              wx.downloadFile({
                url: 'https://234.collemt.club:3891/onFetch/' + res.data + '.mp3',
                success: function (res3) {
                  // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
                  if (res3.statusCode == 200) {

                    wx.saveFile({
                      tempFilePath: res3.tempFilePath,
                      success: function (res4) {
                        thisp.setData({
                          resultpath: res4.savedFilePath
                        });
                        console.log(thisp.data.resultpath);
                        if (thisp.data.autoplay)
                          thisp.onvoiceplay();
                      }
                    });
                    wx.hideLoading();

                  }
                }
              });
            }
          })
        },
      })
    }
    
  },
  bindlanChange: function(e) {
    this.setData({
      lanIndex: e.detail.value,
      lan: this.data.languages[e.detail.value]
    });
    if (e.detail.value == 0) {
      this.setData({
        text: this.data.zh
      });
    }
    else if (e.detail.value == 1) {
      this.setData({
        text: this.data.en
      });
    }
  }
})
