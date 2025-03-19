function loadVavoo() {
    var vavooBtn = document.querySelector('.vavoo-btn');
    vavooBtn.style.background = "red";

    // Vavoo'nun orijinal M3U listesi
    var targetUrl = "https://rideordie.serv00.net/iptv/vavoo/tr.php";

    // Cloudflare Worker Proxy URL'si
    var corsProxy = "https://burakkoz.burak-kozakbas.workers.dev/?url=";

    // Proxy kullanarak URL oluştur (ENCODE YOK!)
    var finalUrl = corsProxy + targetUrl;

    var m3uUrlInput = document.getElementById('m3uUrl');
    m3uUrlInput.dataset.fullurl = finalUrl;  // Proxy'li URL'yi sakla
    m3uUrlInput.value = targetUrl;           // Kullanıcıya temiz URL göster

    // M3U dosyasını yükleyelim
    loadM3U(finalUrl);
}

function loadM3U(url) {
    axios.get(url, { responseType: 'text' })
        .then(function(response) {
            var data = response.data;
            if (!data.includes("#EXTM3U") && !data.includes("#EXTINF:")) {
                alert("Geçerli bir M3U dosyası değil!");
                return;
            }
            parseM3U(data);
        })
        .catch(function(error) {
            console.error("M3U yüklenirken hata:", error);
            alert('M3U dosyası yüklenirken hata oluştu!');
        });
}

function parseM3U(data) {
    const lines = data.split('\n').map(line => line.trim()).filter(line => line !== '');
    const channels = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith("#EXTINF:")) {
            let category = "";
            const groupMatch = line.match(/group-title="([^"]+)"/i);
            if (groupMatch) category = groupMatch[1].trim();
            let nameMatch = line.match(/tvg-name="([^"]+)"/i);
            let name = nameMatch ? nameMatch[1].trim() : '';
            if (!name) {
                const parts = line.split(',');
                name = parts.length > 1 ? parts[1].trim() : 'Bilinmeyen Kanal';
            }
            if (!category) category = "Genel";

            let j = i + 1;
            while (j < lines.length && !lines[j].startsWith("http")) j++;
            const channelUrl = lines[j] ? lines[j].trim() : '';

            if (channelUrl) {
                channels.push({ name, url: channelUrl, category });
            }
            i = j;
        }
    }
    
    renderChannelList(channels);
}

function renderChannelList(channels) {
    const channelListDiv = document.getElementById('channelList');
    channelListDiv.innerHTML = '';
    
    channels.forEach(ch => {
        const channelItem = document.createElement('a');
        channelItem.className = 'list-group-item list-group-item-action channel-item';
        channelItem.href = "#";
        channelItem.textContent = ch.name;
        
        channelItem.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.channel-item.active').forEach(el => el.classList.remove('active'));
            this.classList.add('active');
            
            // URL'yi proxy üzerinden yönlendir
            const proxiedUrl = transformUrl(ch.url);
            playChannel(proxiedUrl, ch.name);
        });
        
        channelListDiv.appendChild(channelItem);
    });
}

function transformUrl(url) {
    if (url.includes("vavoo.to")) {
        const proxy = "https://burakkoz.burak-kozakbas.workers.dev/?url=";
        return proxy + encodeURIComponent(url);
    }
    return url;
}

function playChannel(url, name = "") {
    const videoPlayer = document.getElementById('videoPlayer');
    
    if (Hls.isSupported()) {
        if (window.hls) {
            window.hls.destroy();
        }
        window.hls = new Hls();
        window.hls.loadSource(url);
        window.hls.attachMedia(videoPlayer);
        window.hls.on(Hls.Events.MANIFEST_PARSED, function () {
            videoPlayer.play();
        });
    } else {
        videoPlayer.src = url;
        videoPlayer.load();
        videoPlayer.play();
    }

    document.getElementById("currentChannel").innerText = "Şu anda oynatılan kanal: " + (name || "Bilinmeyen Kanal");
    document.getElementById("currentLink").value = url;
}
