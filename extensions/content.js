const sock = new WebSocket('ws://127.0.0.1:27900')

const playImgURL = chrome.extension.getURL('img/play.png')
const stopImgURL = chrome.extension.getURL('img/stop.png')
const twitterIconURL = chrome.extension.getURL('img/twitter-icon.png')
let pauseSyncFlag = false
let oldDimension = "2"
let intervalId = setInterval(() => {}, 1000)

const setUp = () =>{
  setTimeout(() => {
    $("div.mhy-map__action-btn--feedback").remove()
    $("div.mhy-map__action-btns").append($.parseHTML(`
      <div id="user-guide-sync" class="mhy-map__action-btn mhy-map__action-btn--routes toggleSync">
      <img src="${pauseSyncFlag?playImgURL:stopImgURL}" class="action-btn__btn-pic">
      <div class="tooltip tooltip--left">同期切替</div>
    </div>`))
    $("body").append($.parseHTML(`
      <div style="position:absolute;z-index:100;display: flex;align-items: center;height:100%;width:100%;justify-content: space-around;color: red;pointer-events: none;">
        ●
    </div>`))
    $("div.toggleSync").on('click', ()=> {
      pauseSyncFlag = pauseSyncFlag?false:true
      $("div.toggleSync").children("img").attr('src',pauseSyncFlag?playImgURL:stopImgURL)
      if(pauseSyncFlag){
        clearInterval(intervalId)
      }else{
        intervalId = setInterval(() => {
          sock.send(location.hash.slice(6, 7))
        }, 2000)
      }
    })
    $("div.mhy-map__action-btns").append($.parseHTML(`
      <div id="user-guide-sync" class="mhy-map__action-btn mhy-map__action-btn--routes DeveloperTwitter">
      <img src="${twitterIconURL}" class="action-btn__btn-pic">
      <div class="tooltip tooltip--left">開発者のTwitter</div>
    </div>`))
    $("div.DeveloperTwitter").on('click', ()=> {
      window.open('https://twitter.com/rollphes')
    })
  }, 2000)
}
setUp()

setInterval(()=>{
  $('a[href*="postList"]').remove()
  $("div.bbs-qr").remove()
  const thisDimension = location.hash.slice(6, 7)
  if(thisDimension != oldDimension)setUp()
  oldDimension = thisDimension
},1000)

sock.addEventListener('open', (e) => {
   intervalId = setInterval(() => {
    sock.send(location.hash.slice(6, 7))
   }, 2000)
})

sock.addEventListener('message', (e) => {
  if (!e.data.match(/center/g)||!location.hash.match(/center/g)) return
  location.hash = location.hash.replace(/center=.*(?=&)/,e.data)
})

sock.addEventListener('close', (e) => {
})

sock.addEventListener('error', (e) => {
})