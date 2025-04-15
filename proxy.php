<?php
// Gerekli CORS header'ı: Tüm domainlerden gelen isteklere izin veriyor.
// Güvenlik açısından bu ayarı düzenleyebilirsiniz.
header("Access-Control-Allow-Origin: *");

// Eğer URL parametresi set edilmişse işleme devam et
if (isset($_GET['url'])) {
    $url = filter_var($_GET['url'], FILTER_SANITIZE_URL);

    // URL geçerli mi diye kontrol edelim (opsiyonel)
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        header("HTTP/1.1 400 Bad Request");
        echo "Geçersiz URL.";
        exit;
    }

    // cURL ile isteği gerçekleştir
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    // Yönlendirmeleri takip et
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    // İstek sırasında oluşabilecek sorunlar için timeout değeri (örneğin 10 saniye)
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);

    // Yanıtı al
    $response = curl_exec($ch);
    $err = curl_error($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    // HTTP durum kodu 200 (OK) ise yanıtı döndür
    if ($status >= 200 && $status < 300) {
        echo $response;
    } else {
        header("HTTP/1.1 ".$status);
        echo "Hata: " . $err;
    }
} else {
    header("HTTP/1.1 400 Bad Request");
    echo "Hata: URL parametresi eksik.";
}
?>
