/* -------------------------------------------------------------------------- */
/*                             Main functionality                             */
/* -------------------------------------------------------------------------- */
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: main,
  });
});

const main = async () => {
  try {
    /* -------------------------------------------------------------------------- */
    /*                              Countdown helpers                             */
    /* -------------------------------------------------------------------------- */

    const FULL_DASH_ARRAY = 283;
    const WARNING_THRESHOLD = 2;
    const ALERT_THRESHOLD = 1;

    const COLOR_CODES = {
      info: {
        color: "green",
      },
      warning: {
        color: "orange",
        threshold: WARNING_THRESHOLD,
      },
      alert: {
        color: "red",
        threshold: ALERT_THRESHOLD,
      },
    };

    const TIME_LIMIT = 3;

    const $COUNTDOWN = (function () {
      let timePassed = 0;
      let timeLeft = TIME_LIMIT;
      let timerInterval = null;
      let remainingPathColor = COLOR_CODES.info.color;

      const $countdown = {};

      $countdown.$PREFFIX = "__pihhs-screen-recorder__countdown__";
      $countdown.$SUFFIX = "__";
      $countdown.$OVERLAY = {
        id: $countdown.$PREFFIX + "overlay" + $countdown.$SUFFIX,
        $element: null,
      };
      $countdown.$TIMER = {
        id: $countdown.$PREFFIX + "base-timer" + $countdown.$SUFFIX,
        $element: null,
      };
      $countdown.$TIMER_SVG = {
        id: $countdown.$PREFFIX + "base-timer__svg" + $countdown.$SUFFIX,
        $element: null,
      };
      $countdown.$TIMER_CIRCLE = {
        id: $countdown.$PREFFIX + "base-timer__circle" + $countdown.$SUFFIX,
        $element: null,
      };
      $countdown.$TIMER_PATH_ELAPSED = {
        id:
          $countdown.$PREFFIX + "base-timer__path-elapsed" + $countdown.$SUFFIX,
        $element: null,
      };
      $countdown.$TIMER_PATH_REMAINING = {
        id:
          $countdown.$PREFFIX +
          "base-timer-path-remaining" +
          $countdown.$SUFFIX,
        $element: null,
      };
      $countdown.$TIMER_LABEL = {
        id: $countdown.$PREFFIX + "base-timer-label" + $countdown.$SUFFIX,
        $element: null,
      };
      $countdown.state = {
        timePassed,
        timeLeft,
        timerInterval,
        remainingPathColor,
      };
      return $countdown;
    })();

    function formatTime(time) {
      const minutes = Math.floor(time / 60);
      let seconds = time % 60;

      if (seconds < 10) {
        seconds = `0${seconds}`;
      }

      return `${minutes}:${seconds}`;
    }

    function createCountDown() {
      console.log("createCountDown");
      try {
        const $overlay = document.createElement("div");
        $overlay.id = $COUNTDOWN.$OVERLAY.id;
        $overlay.classList.add("transition");
        $overlay.innerHTML = `
  <style>
  .transition{
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 400ms !important;
  }
  .opacity-0{
    opacity:0
  }
    #${$COUNTDOWN.$OVERLAY.id} {
      
      display: grid;
      height: 100vh;
      place-items: center;
      z-index: 10000000; 
      position: fixed;
      width: 100vw;
      backdrop-filter: blur(2px);
    }
    
    #${$COUNTDOWN.$OVERLAY.id} .${$COUNTDOWN.$TIMER.id} {
      position: relative;
      width: 300px;
      height: 300px;
    }
    
    #${$COUNTDOWN.$OVERLAY.id} .${$COUNTDOWN.$TIMER_SVG.id} {
      transform: scaleX(-1);
    }
    
    #${$COUNTDOWN.$OVERLAY.id} .${$COUNTDOWN.$TIMER_CIRCLE.id} {
      fill: none;
      stroke: none;
    }
    
    #${$COUNTDOWN.$OVERLAY.id} .${$COUNTDOWN.$TIMER_PATH_ELAPSED.id} {
      stroke-width: 7px;
      stroke: rgba(0,0,0,0.01);
    }
    
    #${$COUNTDOWN.$OVERLAY.id} .${$COUNTDOWN.$TIMER_PATH_REMAINING.id} {
      stroke-width: 7px;
      stroke-linecap: round;
      transform: rotate(90deg);
      transform-origin: center;
      transition: 1s linear all;
      fill-rule: nonzero;
      stroke: currentColor;
    }
    
    #${$COUNTDOWN.$OVERLAY.id} .${$COUNTDOWN.$TIMER_PATH_REMAINING.id}.green {
      color: rgb(65, 184, 131);
    }
    
    #${$COUNTDOWN.$OVERLAY.id} .${$COUNTDOWN.$TIMER_PATH_REMAINING.id}.orange {
      color: orange;
    }
    
    #${$COUNTDOWN.$OVERLAY.id} .${$COUNTDOWN.$TIMER_PATH_REMAINING.id}.red {
      color: red;
    }
    
    #${$COUNTDOWN.$OVERLAY.id} .${$COUNTDOWN.$TIMER_LABEL.id} {
      position: absolute;
      width: 300px;
      height: 300px;
      top: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
    }
  </style>
  <div class="${$COUNTDOWN.$TIMER.id}">
    <svg class="${
      $COUNTDOWN.$TIMER_SVG.id
    }" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g class="${$COUNTDOWN.$TIMER_CIRCLE.id}">
        <circle class="${
          $COUNTDOWN.$TIMER_PATH_ELAPSED.id
        }" cx="50" cy="50" r="45"></circle>
        <path
          id="${$COUNTDOWN.$TIMER_PATH_REMAINING.id}"
          stroke-dasharray="283"
          class="${$COUNTDOWN.$TIMER_PATH_REMAINING.id} ${
          $COUNTDOWN.state.remainingPathColor
        }"
          d="
            M 50, 50
            m -45, 0
            a 45,45 0 1,0 90,0
            a 45,45 0 1,0 -90,0
          "
        ></path>
      </g>
    </svg>
    <span id="${$COUNTDOWN.$TIMER_LABEL.id}" class="${
          $COUNTDOWN.$TIMER_LABEL.id
        }">${formatTime($COUNTDOWN.state.timeLeft)}</span>
  </div>
  `;

        $COUNTDOWN.$OVERLAY.$element = $overlay;

        document.body.append($COUNTDOWN.$OVERLAY.$element);
      } catch (ex) {
        console.info("error #2");
        console.warn(ex);
      }
    }

    function deleteCountDown() {
      try {
        onTimesUp();
        $COUNTDOWN.$OVERLAY.$element.remove();
      } catch (ex) {
        console.info("error #1");
        console.warn(ex);
      }
    }

    async function startCountDown() {
      console.log("startCountDown");
      createCountDown();
      await startTimer();

      deleteCountDown();
    }

    function onTimesUp() {
      clearInterval($COUNTDOWN.state.timerInterval);
    }

    function startTimer() {
      return new Promise((res) => {
        const countDown = function (step = 1) {
          $COUNTDOWN.state.timePassed = $COUNTDOWN.state.timePassed += step;
          $COUNTDOWN.state.timeLeft = TIME_LIMIT - $COUNTDOWN.state.timePassed;
          document.getElementById($COUNTDOWN.$TIMER_LABEL.id).innerHTML =
            formatTime($COUNTDOWN.state.timeLeft);
          setCircleDasharray();
          setRemainingPathColor($COUNTDOWN.state.timeLeft);
          console.log($COUNTDOWN.state.timeLeft);
          if ($COUNTDOWN.state.timeLeft == 1) {
            setTimeout(() => {
              $COUNTDOWN.$OVERLAY.$element.classList.add("opacity-0");
            }, 750);
          }
          if ($COUNTDOWN.state.timeLeft <= 0) {
            onTimesUp();

            setTimeout(() => {
              res();
            }, 100);
          }
        };
        $COUNTDOWN.state.timerInterval = setInterval(() => {
          countDown(1);
        }, 1000);

        countDown(0);
      });
    }

    function setRemainingPathColor(timeLeft) {
      const { alert, warning, info } = COLOR_CODES;
      const $el = document.getElementById($COUNTDOWN.$TIMER_PATH_REMAINING.id);
      if (timeLeft <= alert.threshold) {
        $el.classList.remove(warning.color);
        $el.classList.add(alert.color);
      } else if (timeLeft <= warning.threshold) {
        $el.classList.remove(info.color);
        $el.classList.add(warning.color);
      }
    }

    function calculateTimeFraction() {
      const rawTimeFraction = $COUNTDOWN.state.timeLeft / TIME_LIMIT;
      return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
    }

    function setCircleDasharray() {
      const circleDasharray = `${(
        calculateTimeFraction() * FULL_DASH_ARRAY
      ).toFixed(0)} 283`;
      document
        .getElementById($COUNTDOWN.$TIMER_PATH_REMAINING.id)
        .setAttribute("stroke-dasharray", circleDasharray);
    }

    /* -------------------------------------------------------------------------- */
    /*                                Prompt Logic                                */
    /* -------------------------------------------------------------------------- */
    function createPrompt() {
      const $prompt = document.createElement("div");
      $prompt.$PREFFIX = "__pihhs-screen-recorder__modal__";
      $prompt.$SUFFIX = "__";
      $prompt.id = $prompt.$PREFFIX;
      $prompt.innerHTML = `<style>
      * {
      margin: 0;
      padding: 0;
  }
      .cognus-modal {
        cursor: pointer;
        position: fixed;
        z-index: 10;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        overflow-y: auto;
        transition-property: all;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 400ms !important;
    }
    @media (min-width: 640px)
.cognus-modal > div {
    display: block;
    padding: 0;
}
.cognus-modal > div {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding-top: 1rem;
    padding-left: 1rem;
    padding-right: 1rem;
    padding-bottom: 5rem;
    text-align: center;
}
.cognus-modal > div > div:nth-child(1) {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transition-property: opacity;
}
.cognus-modal > div > div:nth-child(1) > div {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  --bg-opacity: 1;
  background-color: #a0aec0;
  background-color: rgba(160, 174, 192, var(--bg-opacity));
  opacity: 0.75;
}
@media (min-width: 640px)
.cognus-modal > div > span {
    display: inline-block;
    vertical-align: middle;
    height: 100vh;
}
.cognus-modal > div > span {
    display: none;
}
.cognus-modal-aria-modal, .cognus-modal-aria-modal.md {
  max-width: 500px;
  width: 500px;
}
.cognus-modal-aria-modal, .cognus-modal-aria-modal.md {
  max-width: 500px;
  width: 500px;
}
@media (min-width: 640px)
.cognus-modal-aria-modal {
  margin-top: 2rem;
  margin-bottom: 2rem;
  vertical-align: middle;
  max-width: 32rem;
  width: 100%;
}
.cognus-modal-aria-modal {
  z-index: 20;
  cursor: default;
  display: inline-block;
  vertical-align: bottom;
  --bg-opacity: 1;
  background-color: #fff;
  background-color: rgba(255, 255, 255, var(--bg-opacity));
  border-radius: 0.5rem;
  text-align: left;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 10%), 0 10px 10px -5px rgb(0 0 0 / 4%);
  --transform-translate-x: 0;
  --transform-translate-y: 0;
  --transform-rotate: 0;
  --transform-skew-x: 0;
  --transform-skew-y: 0;
  --transform-scale-x: 1;
  --transform-scale-y: 1;
  transform: translateX(var(--transform-translate-x)) translateY(var(--transform-translate-y)) rotate(var(--transform-rotate)) skewX(var(--transform-skew-x)) skewY(var(--transform-skew-y)) scaleX(var(--transform-scale-x)) scaleY(var(--transform-scale-y));
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
@media (min-width: 640px)
.cognus-modal-body {
    padding: 1.5rem;
    padding-bottom: 1rem;
}
.cognus-modal-body {
    --bg-opacity: 1;
    background-color: #fff;
    background-color: rgba(255, 255, 255, var(--bg-opacity));
    padding-left: 1rem;
    padding-right: 1rem;
    padding-top: 1.25rem;
    padding-bottom: 1rem;
    border-radius: 0.5rem;
}
.cognus-modal-body {
    @apply cognus-bg-white px-4 pt-5 pb-4 rounded-lg: ;
}
@media (min-width: 640px)
.cognus-modal-body {
    padding: 1.5rem;
    padding-bottom: 1rem;
}
.cognus-modal-body {
    --tw-bg-opacity: 1;
    background-color: rgba(255, 255, 255, var(--tw-bg-opacity));
    border-radius: 0.5rem;
    padding-left: 1rem;
    padding-right: 1rem;
    padding-top: 1.25rem;
    padding-bottom: 1rem;
}
.cognus-modal-body .close-icon {
  height: 1em;
  right: 0.7em;
  top: 0.7em;
  position: absolute;
  cursor: pointer;
  --text-opacity: 1;
  color: #f56565;
  color: rgba(245, 101, 101, var(--text-opacity));
}
.cognus-modal-body>div {
  display: block;
}

@media (min-width: 640px)
.cognus-modal-body > div {
  display: flex;
  align-items: flex-start;
}
@media (min-width: 640px)
.cognus-modal-body > div {
}
.w-full {
  width: 100%;
}
.cognus-modal-title {
  --tw-text-opacity: 1;
  color: rgba(17, 24, 39, var(--tw-text-opacity));
  font-size: 1.125rem;
  line-height: 1.75rem;
  font-weight: 500;
  line-height: 1.5rem;
}
.cognus-text-gray-900 {
  --tw-text-opacity: 1;
  color: rgba(17, 24, 39, var(--tw-text-opacity));
}
h3 {
  text-transform: lowercase;
}

h1, h2, h3, h4, h5, h6 {
  font-family: "Roboto", "Helvetica", "Arial", sans-serif;
  font-weight: 300;
  line-height: 1.5em;
}

@media (min-width: 640px)
.cognus-modal-footer {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    display: flex;
    flex-direction: row-reverse;
}
.cognus-modal-footer {
    --bg-opacity: 1;
    background-color: #f7fafc;
    background-color: rgba(247, 250, 252, var(--bg-opacity));
    padding-left: 1rem;
    padding-right: 1rem;
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
    border-bottom-right-radius: 0.5rem;
    border-bottom-left-radius: 0.5rem;
    display: flex;
    flex-direction: row-reverse;
}
@media (min-width: 640px)
.cognus-modal-footer .cognus-button-md {
    margin-bottom: 0px;
    margin-left: 0.5rem;
    width: auto;
}
.cognus-modal-footer .cognus-button-md {
    margin-bottom: 0.5rem;
    width: auto;
}
.border {
    border-width: 1px;
}
.border-red-600 {
    --border-opacity: 1;
    border-color: #e53e3e;
    border-color: rgba(229, 62, 62, var(--border-opacity));
}
button, [type="button"], [type="reset"], [type="submit"] {
    -webkit-appearance: button;
}
.bg-red-gradient {
    color: white;
    background: #e53e3e;
    background: -moz-linear-gradient(top, #e53e3e 0%, #c53030 100%);
    background: -webkit-linear-gradient( top, #e53e3e 0%, #c53030 100% );
    background: linear-gradient(to bottom, #e53e3e 0%, #c53030 100%);
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#e53e3e', endColorstr='#c53030',GradientType=0 );
    border: 1px solid #c53030;
    transition: #e53e3e 0.5s, #c53030 0.5s;
}
.cognus-button-md {
    @apply px-4 py-2 cognus-button: ;
}
.bg-red-gradient {
    color: white;
    background: #e53e3e;
    background: -moz-linear-gradient(top, #e53e3e 0%, #c53030 100%);
    background: -webkit-linear-gradient( top, #e53e3e 0%, #c53030 100% );
    background: linear-gradient(to bottom, #e53e3e 0%, #c53030 100%);
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#e53e3e', endColorstr='#c53030',GradientType=0 );
    border: 1px solid #c53030;
    transition: --red600 0.5s, --red700 0.5s;
}
@media (min-width: 640px)
.cognus-button-md {
    font-size: 0.875rem;
    line-height: 1.25rem;
    line-height: 1.25rem;
}
.cognus-button-md {
    padding-left: 1rem;
    padding-right: 1rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    margin-top: 0px;
    margin-bottom: 0.5rem;
    display: inline-flex;
    justify-content: center;
    border-radius: 0.375rem;
    font-size: 1rem;
    line-height: 1.5rem;
    font-weight: 500;
    text-transform: capitalize;
    line-height: 1.5rem;
    --tw-text-opacity: 1;
    color: rgba(255, 255, 255, var(--tw-text-opacity));
    --tw-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
    transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
    transition-duration: 150ms;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
.border-red-600 {
    --tw-border-opacity: 1;
    border-color: rgba(220, 38, 38, var(--tw-border-opacity));
}
.border {
    border-width: 1px;
}
button, [type='button'], [type='reset'], [type='submit'] {
    -webkit-appearance: button;
}
button, input, optgroup, select, textarea {
    padding: 0;
    line-height: inherit;
    color: inherit;
}
button, [role="button"] {
    cursor: pointer;
}
.bg-white-gradient {
  color: #4a5568;
  background: var(--white200);
  background: -moz-linear-gradient( top, var(--white200) 0%, var(--white300) 100% );
  background: -webkit-linear-gradient( top, var(--white200) 0%, var(--white300) 100% );
  background: linear-gradient( to bottom, var(--white200) 0%, var(--white300) 100% );
  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#fff', endColorstr='#f7fafc',GradientType=0 );
  border: 1px solid var(--white300);
  transition: --white200 0.5s, --white300 0.5s;
}
    .duration-500 {
        transition-duration: 500ms;
    }
    .opacity-100 {
        opacity: 1;
    }
    .opacity-0 {
        opacity: 0;
    }

      </style><div class="cognus-modal duration-500
      opacity-0
      opacity-100" style="z-index: 11;">
<div>
  <div aria-hidden="true">
    <div></div>
  </div>
  <span aria-hidden="true">&ZeroWidthSpace;</span>
  <div class="cognus-modal-aria-modal duration-500 md opacity-0 opacity-100 " role="dialog" aria-modal="true" aria-labelledby="modal-headline">

      <div class="cognus-modal-body">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="close-icon">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        <div class="cognus-modal-body-container">
          <div class="w-full">
            <div>
              <section class="cognus-modal-title-description-slot">
                <h3 class="cognus-modal-title cognus-text-gray-900"> Download recording </h3>
              </section>
              <div class="cognus-input-container " id="ember425">
                <div class="">
                  <label class="cognus-input-label">
                    <span class="ellipsis capitalize cognus-input-label-container"> File name
            
                    </span>
                  </label>
                </div>
                <div class="cognus-input-border-container">
                  <div class="flex bg-indigo-10">
                    <input id="pihhs-recorder__input-title" name=""  autocomplete="off" title="" minlength="Infinity" class="cognus-input " type="text">
                    <span class="cognus-input-border-active"></span>
                  </div>
                  <span class="cognus-input-border"></span>
                </div>
           
                <div class="pb-2"></div>
              </div>
              
            </div>
          </div>
        </div>
        <div class="cognus-modal-error-slot
              opacity-0 h-0
              "> * Please confirm all the required fields are set and valid </div>
      </div>
      <div class="cognus-modal-footer">
        <button id="${$prompt.$PREFFIX}btn-confirm${$prompt.$SUFFIX}" class="cognus-form-button
  cognus-button-md
  bg-red-gradient
  
  border border-red-600
  " type="button"> OK
          <!---->
        </button>
        <button id="${$prompt.$PREFFIX}btn-cancel${$prompt.$SUFFIX}" class="cognus-form-button
  cognus-button-md
  bg-white-gradient
  
  border border-white-600
  " type="button" > cancel
          <!---->
        </button>
      </div>
   
  </div>
</div>
</div>
      `;
      document.body.append($prompt);
      return new Promise((res, rej) => {
        setTimeout(
          () => {
            try {
              $prompt
                .querySelector(".cognus-modal")
                .classList.remove("opacity-0");
              setTimeout(() => {
                try {
                  $prompt
                    .querySelector(".cognus-modal-aria-modal")
                    .classList.remove("opacity-0");
                  res($prompt);
                } catch (ex) {
                  rej();
                }
              }, 200);
            } catch (ex) {
              rej();
            }
          },

          10
        );
      });
    }

    async function showPrompt() {
      const $prompt = await createPrompt();
      return new Promise((res, rej) => {
        document
          .getElementById(`${$prompt.$PREFFIX}btn-cancel${$prompt.$SUFFIX}`)
          .addEventListener("click", () => {
            hidePrompt($prompt);
            rej();
          });
        document
          .getElementById(`${$prompt.$PREFFIX}btn-confirm${$prompt.$SUFFIX}`)
          .addEventListener("click", () => {
            let title = document.getElementById(
              "pihhs-recorder__input-title"
            ).value;
            if (!title) title = "Pihh's-screen-record";

            hidePrompt($prompt);
            res(title);
          });
      });
    }

    async function hidePrompt($prompt) {
      return new Promise((res, rej) => {
        setTimeout(
          () => {
            try {
              let $el = $prompt.querySelector(".cognus-modal-aria-modal");
              $el.classList.remove("opacity-100");
              $el.classList.add("opacity-0");
              setTimeout(() => {
                try {
                  let $el = $prompt.querySelector(".cognus-modal");

                  $el.classList.remove("opacity-100");
                  $el.classList.add("opacity-0");
                  setTimeout(() => {
                    try {
                      $prompt.remove();
                      res();
                    } catch (ex) {
                      rej();
                    }
                  }, 450);
                } catch (ex) {
                  rej();
                }
              }, 200);
            } catch (ex) {
              rej();
            }
          },

          10
        );
      });
    }
    /* -------------------------------------------------------------------------- */
    /*                                 Main logic                                 */
    /* -------------------------------------------------------------------------- */

    // Reset
    const $otherPrompt = document.getElementById(
      "__pihhs-screen-recorder__modal__"
    );
    const $otherCountdown = document.getElementById(
      "__pihhs-screen-recorder__countdown__"
    );
    if ($otherPrompt) $otherPrompt.remove();
    if ($otherCountdown) $otherCountdown.remove();

    let n = Date.now();
    let stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });

    await startCountDown();

    //needed for better browser support
    const mime = MediaRecorder.isTypeSupported("video/webm; codecs=vp9")
      ? "video/webm; codecs=vp9"
      : "video/webm";
    let mediaRecorder = new MediaRecorder(stream, {
      mimeType: mime,
    });

    let chunks = [];
    mediaRecorder.addEventListener("dataavailable", function (e) {
      chunks.push(e.data);
    });

    mediaRecorder.addEventListener("stop", async function () {
      // let title = prompt("Enter your name : ", "Pihh's screen recorder");
      let title = await showPrompt();

      if (title === null) return;
      title = title.trim() || "Pihh's screen recorder";

      let blob = new Blob(chunks, {
        type: chunks[0].type,
      });
      let url = URL.createObjectURL(blob);

      let video = document.createElement("video");
      video.src = url;

      let a = document.createElement("a");
      a.href = url;
      a.download = title + "_" + Date.now() + ".webm";
      a.click();
    });

    //we have to start the recorder manually
    mediaRecorder.start();
  } catch (ex) {
    console.info("error #3");
    console.warn(ex);
  }
};
