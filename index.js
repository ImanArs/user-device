console.log(navigator);
document.querySelector('p').innerText = `${JSON.stringify(navigator.userAgent, null, 2)}`;

function getDeviceType() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // iOS detection
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return 'iOS';
  }

  // Android detection
  if (/android/i.test(userAgent)) {
    return 'Android';
  }

  // Other device detection
  if (/windows phone/i.test(userAgent)) {
    return 'Windows Phone';
  }

  if (/Macintosh/.test(userAgent)) {
    return 'Mac';
  }

  if (/Windows/.test(userAgent)) {
    return 'Windows';
  }

  if (/Linux/.test(userAgent)) {
    return 'Linux';
  }

  return 'Unknown';
}

function getBrowserInfo() {
  const userAgent = navigator.userAgent;
  let browserName = 'Unknown';
  let fullVersion = 'Unknown';

  if (userAgent.indexOf('Chrome') > -1) {
    browserName = 'Chrome';
    fullVersion = userAgent.substring(userAgent.indexOf('Chrome') + 7).split(' ')[0];
  } else if (userAgent.indexOf('Safari') > -1) {
    browserName = 'Safari';
    fullVersion = userAgent.substring(userAgent.indexOf('Version') + 8).split(' ')[0];
  } else if (userAgent.indexOf('Firefox') > -1) {
    browserName = 'Firefox';
    fullVersion = userAgent.substring(userAgent.indexOf('Firefox') + 8);
  } else if (userAgent.indexOf('MSIE') > -1 || !!document.documentMode) {
    browserName = 'Internet Explorer';
    fullVersion = userAgent.substring(userAgent.indexOf('MSIE') + 5).split(';')[0];
  } else if (userAgent.indexOf('Edge') > -1) {
    browserName = 'Edge';
    fullVersion = userAgent.substring(userAgent.indexOf('Edge') + 5);
  }

  return `${browserName} ${fullVersion}`;
}

document.querySelector('h1').innerText = `${getDeviceType()} - ${getBrowserInfo()}`;

document.querySelector('button').addEventListener('click', () => {
  const deviceType = getDeviceType();
  const browserInfo = getBrowserInfo();
  console.log('Device Type:', deviceType);
  console.log('Browser Info:', browserInfo);
  console.log('navigator.share:', navigator.share);

  if (deviceType === 'iOS' && navigator.share) {
    navigator.share({
      title: 'Share this content',
      text: 'Check out this content!',
      url: window.location.href
    }).then(() => {
      console.log('Content shared successfully');
    }).catch((error) => {
      console.error('Error sharing content:', error);
    });
  } else {
    alert('Sharing is not supported on this device.');
  }
});

console.log('Device Type:', getDeviceType());
console.log('Browser Info:', getBrowserInfo());

let deviceData = {
  deviceType: getDeviceType(),
  browserInfo: getBrowserInfo(),
  publicIp: '',
  localIp: '',
  geolocation: '',
  networkType: '',
  systemInfo: {
    platform: navigator.platform,
    architecture: navigator.userAgent.includes('WOW64') || navigator.userAgent.includes('Win64') ? '64-bit' : '32-bit'
  },
  performanceInfo: '',
  mediaDevices: '',
  sensorInfo: '',
  batteryInfo: '',
  memoryInfo: '',
  language: navigator.language || navigator.userLanguage,
  timeInfo: {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    currentTime: new Date().toLocaleString()
  }
};

// Fetch public IP address using ipify API
fetch('https://api.ipify.org?format=json')
  .then(response => response.json())
  .then(data => {
    deviceData.publicIp = data.ip;
    document.getElementById('ip').innerText = `Public IP Address: ${data.ip}`;
    console.log('Public IP Address:', data.ip);
  })
  .catch(error => {
    console.error('Error fetching public IP address:', error);
  });

// Fetch local IP address using WebRTC
function getLocalIP(callback) {
  const pc = new RTCPeerConnection({
    iceServers: []
  });
  pc.createDataChannel('');
  pc.createOffer().then(offer => pc.setLocalDescription(offer)).catch(error => console.error('Error creating offer:', error));
  pc.onicecandidate = (ice) => {
    if (ice && ice.candidate) {
      console.log('ICE candidate:', ice.candidate.candidate);
      const ipMatch = ice.candidate.candidate.match(/([0-9]{1,3}\.){3}[0-9]{1,3}/);
      console.log('ice', ice);
      
      if (ipMatch) {
        callback(ipMatch[0]);
        document.getElementById('localIp').innerText = `Local IP Address: ${ipMatch[0]}`;
        console.log('Local IP Address:', ipMatch[0]);
      }
    } else {
      console.log('ICE candidate gathering complete');
    }
  };
}

getLocalIP((ip) => {
  deviceData.localIp = ip;
  console.log('Local IP Address:', ip);
  
  document.getElementById('localIp').innerText = `Local IP Address: ${ip}`;
  console.log('Local IP Address:', ip);
});

// Fetch geolocation
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    deviceData.geolocation = `Latitude: ${latitude}, Longitude: ${longitude}`;
    document.getElementById('geo').innerText = `Latitude: ${latitude}, Longitude: ${longitude}`;
    console.log('Geolocation:', `Latitude: ${latitude}, Longitude: ${longitude}`);
  }, (error) => {
    console.error('Error fetching geolocation:', error);
    if (error.code === error.PERMISSION_DENIED) {
      document.getElementById('geo').innerText = 'Geolocation permission denied. Please enable location permissions in your browser settings and try again.';
    } else {
      document.getElementById('geo').innerText = 'Error fetching geolocation.';
    }
  });
} else {
  document.getElementById('geo').innerText = 'Geolocation is not supported by this browser.';
}

// Fetch network information
if (navigator.connection) {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const type = connection.effectiveType;
  deviceData.networkType = type;
  document.getElementById('network').innerText = `Network type: ${type}`;
  console.log('Network type:', type);
} else {
  document.getElementById('network').innerText = 'Network information is not supported by this browser.';
}

// Fetch performance information
const performanceInfo = window.performance.timing;
const pageLoadTime = performanceInfo.loadEventEnd - performanceInfo.navigationStart;
deviceData.performanceInfo = `Page Load Time: ${pageLoadTime} ms`;
document.getElementById('performance').innerText = `Page Load Time: ${pageLoadTime} ms`;
console.log('Performance Information:', `Page Load Time: ${pageLoadTime} ms`);

// Fetch media devices information
if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
  navigator.mediaDevices.enumerateDevices().then((devices) => {
    const mediaDevices = devices.map(device => `${device.kind}: ${device.label}`).join(', ');
    deviceData.mediaDevices = mediaDevices;
    document.getElementById('media').innerText = `Media Devices: ${mediaDevices}`;
    console.log('Media Devices:', mediaDevices);
  }).catch((error) => {
    console.error('Error fetching media devices information:', error);
  });
} else {
  document.getElementById('media').innerText = 'Media devices information is not supported by this browser.';
}

// Fetch sensor information
if ('DeviceMotionEvent' in window) {
  window.addEventListener('devicemotion', (event) => {
    const acceleration = event.acceleration;
    const rotationRate = event.rotationRate;
    deviceData.sensorInfo = `Acceleration: ${JSON.stringify(acceleration)}, Rotation Rate: ${JSON.stringify(rotationRate)}`;
    document.getElementById('sensors').innerText = `Acceleration: ${JSON.stringify(acceleration)}, Rotation Rate: ${JSON.stringify(rotationRate)}`;
    console.log('Sensor Information:', `Acceleration: ${JSON.stringify(acceleration)}, Rotation Rate: ${JSON.stringify(rotationRate)}`);
  });
} else {
  document.getElementById('sensors').innerText = 'Sensor information is not supported by this browser.';
}

// Fetch battery information
if (navigator.getBattery) {
  navigator.getBattery().then((battery) => {
    const batteryInfo = `Level: ${battery.level * 100}%, Charging: ${battery.charging}`;
    deviceData.batteryInfo = batteryInfo;
    document.getElementById('battery').innerText = `Battery: ${batteryInfo}`;
    console.log('Battery Information:', batteryInfo);
  }).catch((error) => {
    console.error('Error fetching battery information:', error);
  });
} else {
  document.getElementById('battery').innerText = 'Battery information is not supported by this browser.';
}

// Fetch memory information
if (navigator.deviceMemory) {
  const memory = navigator.deviceMemory;
  deviceData.memoryInfo = `${memory} GB`;
  document.getElementById('memory').innerText = `Device Memory: ${memory} GB`;
  console.log('Device Memory:', `${memory} GB`);
} else {
  document.getElementById('memory').innerText = 'Memory information is not supported by this browser.';
}

// Fetch language information
const language = navigator.language || navigator.userLanguage;
deviceData.language = language;
document.getElementById('language').innerText = `Language: ${language}`;
console.log('Language:', language);

// Fetch time information
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const currentTime = new Date().toLocaleString();
deviceData.timeInfo = {
  timeZone: timeZone,
  currentTime: currentTime
};
document.getElementById('time').innerText = `Time Zone: ${timeZone}, Current Time: ${currentTime}`;
console.log('Time Information:', `Time Zone: ${timeZone}, Current Time: ${currentTime}`);

// Function to send data to backend
function sendDataToBackend(data) {
  fetch('https://636a27e5b10125b78fd2189a.mockapi.io/data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(result => {
    console.log('Data sent successfully:', result);
  })
  .catch(error => {
    console.error('Error sending data:', error);
  });
}

// Send data to backend after collecting all information
setTimeout(() => {
  sendDataToBackend(deviceData);
}, 15000); // Delay to ensure all async operations are complete