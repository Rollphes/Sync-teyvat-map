const sock = new WebSocket("ws://127.0.0.1:8080");

sock.addEventListener("open", (e) => {
  console.log("接続を確認しました");
});

sock.addEventListener("message", (e) => {
  if (!e.data.match(/center/g)) {
    console.log(e.data);
    return;
  }
  var hash = location.hash.slice(8).split("&");
  hash[hash.findIndex((a) => a.match(/center/g))] = e.data;
  console.log(e.data);
  location.hash = location.hash.slice(0, 8) + hash.join("&");
});

sock.addEventListener("close", (e) => {
  console.log("接続を終了しました");
});

sock.addEventListener("error", (e) => {
  console.log("エラーが発生しました");
});
