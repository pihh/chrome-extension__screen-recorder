// Initialize button with users' preferred color

console.log("xxxxxxxx popup");
let $btnStart = document.getElementById("changeColor");

// // chrome.storage.sync.get("color", ({ color }) => {
// //   $btnStart.style.backgroundColor = color;
// // });

// // // When the button is clicked, inject setPageBackgroundColor into current page
// $btnStart.addEventListener("click", async () => {
//   // let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

//   // chrome.scripting.executeScript({
//   //   target: { tabId: tab.id },
//   //   func: setPageBackgroundColor,
//   // });
chrome.runtime.sendMessage("startRecorder", function (response) {
  console.log("res", response);
  //   navigator.mediaDevices
  //     .getUserMedia({
  //       video: {
  //         mandatory: {
  //           chromeMediaSource: "desktop",
  //           chromeMediaSourceId: response.streamId,
  //         },
  //       },
  //     })
  //     .then((returnedStream) => {
  //       stream = returnedStream;
  //       $video.src = URL.createObjectURL(stream);
  //       $getScreen.style.display = "none";
  //       $stopScreen.style.display = "inline";

  //       $stopScreen.addEventListener("click", (event) => {
  //         stream.getTracks().forEach((track) => track.stop());
  //         $video.src = "";
  //         $stopScreen.style.display = "none";
  //         $getScreen.style.display = "inline";
  //       });
  //     })
  //     .catch((err) => {
  //       console.error("Could not get stream: ", err);
  //     });
  // });
});

window.contentScriptHasRun = false;

(function () {
  // prevent the content script from running multiple times
  if (window.contentScriptHasRun) {
    return;
  }

  window.contentScriptHasRun = true;

  const port = chrome.runtime.connect(chrome.runtime.id);
  port.onMessage.addListener((msg) => {
    window.postMessage(msg, "*");
  });

  window.addEventListener(
    "message",
    (event) => {
      // Only accept messages from ourselves
      if (event.source !== window) {
        return;
      }
      // Only accept events with a data type
      if (!event.data.type) {
        return;
      }

      if (["SS_UI_REQUEST", "SS_UI_CANCEL"].includes(event.data.type)) {
        port.postMessage(event.data);
      }
    },
    false
  );

  window.postMessage({ type: "SS_PING", text: "start" }, "*");
})();

// // // The body of this function will be executed as a content script inside the
// // // current page
// // function setPageBackgroundColor() {
// //   chrome.storage.sync.get("color", ({ color }) => {
// //     document.body.style.backgroundColor = color;
// //   });
// // }

// window.contentScriptHasRun = false;

// (function() {
//   // prevent the content script from running multiple times
//   if (window.contentScriptHasRun) {
//     return;
//   }

//   window.contentScriptHasRun = true;

//   const port = chrome.runtime.connect(chrome.runtime.id);
//   port.onMessage.addListener(msg => {
//     window.postMessage(msg, '*');
//   });

//   window.addEventListener(
//     'message',
//     event => {
//       // Only accept messages from ourselves
//       if (event.source !== window) {
//         return;
//       }
//       // Only accept events with a data type
//       if (!event.data.type) {
//         return;
//       }

//       if (['SS_UI_REQUEST', 'SS_UI_CANCEL'].includes(event.data.type)) {
//         port.postMessage(event.data);
//       }
//     },
//     false
//   );

//   window.postMessage({ type: 'SS_PING', text: 'start' }, '*');
// })();
