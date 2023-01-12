console.log("Example Extension - BlueGrid Content Script initialized.");

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  console.log("Message received!", { msg });
  // if (msg.text === "invertColors") {
  //   console.log("Message received!");
  // }
  return true;
});
// // Listen for messages from the background.js
// let currentlyEnabled = false;
// chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
//   if (msg.text === "invertColors") {
//     // Prepare the required CSS for inversion
//     let css = "";
//     if (currentlyEnabled) {
//       css =
//         "html {-webkit-filter: invert(0%);" +
//         "-moz-filter: invert(0%);" +
//         "-o-filter: invert(0%);" +
//         "-ms-filter: invert(0%); }";
//       currentlyEnabled = false;
//     } else {
//       css =
//         "html {-webkit-filter: invert(100%);" +
//         "-moz-filter: invert(100%);" +
//         "-o-filter: invert(100%);" +
//         "-ms-filter: invert(100%); }";
//       currentlyEnabled = true;
//     }

//     // Create and append the style element onto the web page
//     let style = document.createElement("style");
//     style.appendChild(document.createTextNode(css));
//     document.getElementsByTagName("head")[0].appendChild(style);
//   }
// });
