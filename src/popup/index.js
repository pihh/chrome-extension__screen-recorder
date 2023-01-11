import "./index.css";

const crx = "create-chrome-ext";

// const $btnStartRecording = document.getElementById("start-recording");
const $btnStartRecording = document.getElementById("header");
const $inputTitle = document.getElementById("input-title");
const $inputMime = document.getElementById("input-mime");
const $video = document.querySelector("video");

const MIME_MAP = {};
const FALLBACK_TITLE = "pihhs-screen-recorder-extension";
const VIDEO_TYPES = ["webm", "ogg", "mp4", "x-matroska"];
const AUDIO_TYPES = ["webm", "ogg", "mp3", "x-matroska"];
const CODECS = [
  "vp9",
  "vp9.0",
  "vp8",
  "vp8.0",
  "avc1",
  "av1",
  "h265",
  "h.265",
  "h264",
  "h.264",
  "opus",
  "pcm",
  "aac",
  "mpeg",
  "mp4a",
];

/* -------------------------------------------------------------------------- */
/*                             Main functionality                             */
/* -------------------------------------------------------------------------- */
function startRecorder() {
  recordScreen();
}

function loadMimeMap() {
  const supportedVideos = getSupportedMimeTypes("video", VIDEO_TYPES, CODECS);
  // const supportedAudios = getSupportedMimeTypes("audio", AUDIO_TYPES, CODECS);

  let $firstOption = true;
  for (let videoType of VIDEO_TYPES) {
    const fallback = `video/${videoType}`;

    if (supportedVideos.indexOf(fallback) > -1 && !MIME_MAP[videoType]) {
      MIME_MAP[videoType] = {
        supported: fallback + ";codecs=vp9",
        fallback,
      };

      const $inputMimeOption = document.createElement("option");
      $inputMimeOption.innerText = videoType;
      $inputMimeOption.value = videoType;
      $inputMimeOption.selected = $firstOption;
      $inputMime.append($inputMimeOption);

      $firstOption = false;
    }
  }
}

function loadTitleName() {
  $inputTitle.value = FALLBACK_TITLE;
}

function setButtonAction() {
  $btnStartRecording.addEventListener("click", startRecorder);
}

function init() {
  loadTitleName();
  loadMimeMap();
  setButtonAction();
}

/* -------------------------------------------------------------------------- */
/*                              Helper functions                              */
/* -------------------------------------------------------------------------- */

function getSupportedMimeTypes(media, types, codecs) {
  const isSupported = MediaRecorder.isTypeSupported;
  const supported = [];
  types.forEach((type) => {
    const mimeType = `${media}/${type}`;
    codecs.forEach((codec) =>
      [
        `${mimeType};codecs=${codec}`,
        `${mimeType};codecs=${codec.toUpperCase()}`,
      ].forEach((variation) => {
        if (isSupported(variation)) supported.push(variation);
      })
    );
    if (isSupported(mimeType)) supported.push(mimeType);
  });
  return supported;
}

function getVideoMime() {
  const $mime = $inputMime.value;
  return $mime;
}

function getVideoTitle() {
  let $mime = getVideoMime();
  let $title = $inputTitle.value || FALLBACK_TITLE;

  return $title + "__" + Date.now() + "." + $mime;
}
async function recordScreen() {
  try {
    const $title = getVideoTitle();
    const $mime = getVideoMime();

    let stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });

    //needed for better browser support
    const mime = MediaRecorder.isTypeSupported(MIME_MAP[$mime].supported)
      ? MIME_MAP[$mime].supported
      : MIME_MAP[$mime].fallback;

    let mediaRecorder = new MediaRecorder(stream, {
      mimeType: mime,
    });

    let chunks = [];
    mediaRecorder.addEventListener("dataavailable", function (e) {
      chunks.push(e.data);
    });

    mediaRecorder.addEventListener("stop", function () {
      let blob = new Blob(chunks, {
        type: chunks[0].type,
      });
      let url = URL.createObjectURL(blob);

      $video.src = url;

      let a = document.createElement("a");
      a.href = url;
      a.download = $title;
      a.click();
    });

    //we have to start the recorder manually
    mediaRecorder.start();
  } catch (ex) {
    console.warn(ex);
    // alert("failed to start recoding");
  }
}

/* -------------------------------------------------------------------------- */
/*                               Boot extension                               */
/* -------------------------------------------------------------------------- */
init();
