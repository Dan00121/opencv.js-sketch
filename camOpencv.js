const video = document.querySelector('#webcam');
const enableWebcamButton = document.querySelector('#enableWebcamButton');
const disableWebcamButton = document.querySelector('#disableWebcamButton');
const canvas1 = document.querySelector('#outputCanvas1');
const canvas2 = document.querySelector('#outputCanvas2');


function onOpenCvReady() {
  document.querySelector('#status').innerHTML = 'opencv.js is ready.';
  /* enable the button */
  enableWebcamButton.disabled = false;
}
/* Check if webcam access is supported. */
function getUserMediaSupported() {
  /* Check if both methods exists.*/
  return !!(navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia);
    
    /* alternative approach 
    return ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices);
    */
}
  
  /* 
   * If webcam is supported, add event listener to button for when user
   * wants to activate it to call enableCam function which we will 
   * define in the next step.
   */

if (getUserMediaSupported()) {
  enableWebcamButton.addEventListener('click', enableCam);
  disableWebcamButton.addEventListener('click', disableCam);
} else {
  console.warn('getUserMedia() is not supported by your browser');
}

function enableCam(event) {
  /* disable this button once clicked.*/
  event.target.disabled = true;
    
  /* show the disable webcam button once clicked.*/
  disableWebcamButton.disabled = false;

  /* show the video and canvas elements */
  document.querySelector("#liveView").style.display = "block";

  // getUsermedia parameters to force video but not audio.
  const constraints = {
    video: true
  };

  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    video.srcObject = stream;
    video.addEventListener('loadeddata', processVid);
  })
  .catch(function(err){
    console.error('Error accessing media devices.', error);
  });
};

function disableCam(event) {
    event.target.disabled = true;
    enableWebcamButton.disabled = false;

    /* stop streaming */
    video.srcObject.getTracks().forEach(track => {
      track.stop();
    })
  
    /* clean up. some of these statements should be placed in processVid() */
    video.srcObject = null;
    video.removeEventListener('loadeddata', processVid);
    const context1 = canvas1.getContext('2d');
    const context2 = canvas2.getContext('2d');
    context1.clearRect(0, 0, canvas1.width, canvas1.height);
	context2.clearRect(0, 0, canvas2.width, canvas2.height);
    document.querySelector("#liveView").style.display = "none";
}

function processVid() {

    if (video.srcObject == null) {
      return;
    }

    let cap = new cv.VideoCapture(video);
    /* 8UC4 means 8-bit unsigned int, 4 channels */
    let frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    cap.read(frame);
    processFrame(frame);
}

function processFrame(src) {
    let dst = new cv.Mat();
	let img1 = new cv.Mat() ;
	let img2 = new cv.Mat() ;
	let img3 = new cv.Mat() ;
	let img4 = new cv.Mat() ;
	let img5 = new cv.Mat() ;
	let ksize = new cv.Size(21, 21);
	let rgbChannels = new cv.MatVector();
	const lThreshold = document.getElementById("thL");
    const hThreshold = document.getElementById("thH");
	cv.cvtColor(src, img1, cv.COLOR_RGBA2GRAY);
	cv.bitwise_not(img1,img2) ;
    cv.GaussianBlur(img2, img3, ksize , 0 , 0 ) ;
	cv.bitwise_not(img3,img4) ;
	cv.divide(img1,img4,img5,256,-1) ;
	cv.Canny(src, dst, Number(lThreshold.value), Number(hThreshold.value));
    cv.imshow('outputCanvas1', dst);
	cv.imshow('outputCanvas2', img5);
    src.delete();
    dst.delete();
	img1.delete();
	img2.delete();
	img3.delete();
	img4.delete();
	img5.delete();
    /* Call this function again to keep processing when the browser is ready. */
    window.requestAnimationFrame(processVid);
}