	function loadVavoo() {
	  var vavooBtn = document.querySelector('.vavoo-btn');
	  vavooBtn.style.background = "red";
	  // Hedef (orijinal) Vavoo URL'si
	  var targetUrl = "https://rideordie.serv00.net/iptv/vavoo/tr.php";
	  // Cloudflare Worker proxy URL'si
	  var corsProxy = "https://burakkoz.burak-kozakbas.workers.dev/?url=";
	  // Proxylü URL
	  var finalUrl = corsProxy + targetUrl;
	  
	  var m3uUrlInput = document.getElementById('m3uUrl');
	  // Proxylü URL'yi data attribute'da saklıyoruz
	  m3uUrlInput.dataset.fullurl = finalUrl;
	  // Kullanıcıya gösterilen kısımda sadece orijinal URL gözüküyor
	  m3uUrlInput.value = targetUrl;
	  
	  // M3U dosyası yüklemesini başlatıyoruz
	  loadM3U();
	}
