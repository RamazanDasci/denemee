(function (global, factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        // CommonJS / Node.js ortamı
        module.exports = factory();
    } else if (typeof define === "function" && define.amd) {
        // AMD ortamı
        define([], factory);
    } else {
        // Tarayıcı ortamı: global değişkene ekliyoruz
        global.initializeCustomImageUpload = factory();
    }
}(typeof window !== "undefined" ? window : this, function () {
    /**
     * initializeCustomImageUpload
     * Belirtilen container içinde bulunan gerekli elemanlara bağlı olarak cropper işlevselliğini başlatır.
     *
     * @param {HTMLElement} container - Cropper ve ilgili elemanların bulunduğu container elementi.
     */
    function initializeCustomImageUpload(container) {
        if (!container) {
            console.error("Container elementi bulunamadı");
            return;
        }

        const imageInput = container.querySelector("#imageInput");
        const cropperImage = container.querySelector("#cropperImage");
        const modalElement = container.querySelector("#imageCropperModal");
        const previewImage = container.querySelector("#cropPreview");
        const confirmCropButton = container.querySelector("#confirmCrop");
        const cancelCropButton = container.querySelector("#cancelCrop");
        const hiddenInput = container.querySelector("#croppedImageInput");

        let cropper;
        let tempImagePath = null;  // Geçici dosya yolunu sakla

        // Gerekli elementlerin varlığını kontrol et
        if (!imageInput || !cropperImage || !modalElement || !previewImage || !confirmCropButton || !cancelCropButton || !hiddenInput) {
            console.error("Gerekli elementler bulunamadı. Lütfen DOM yapınızı kontrol edin.");
            return;
        }

        // Base64'ü Blob'a çeviren fonksiyon
        function base64ToBlob(base64Data) {
            try {
                const parts = base64Data.split(';base64,');
                if (parts.length !== 2) {
                    throw new Error("Geçersiz base64 formatı");
                }
                const contentType = parts[0].split(':')[1];
                const raw = window.atob(parts[1]);
                const rawLength = raw.length;
                const uInt8Array = new Uint8Array(rawLength);

                for (let i = 0; i < rawLength; ++i) {
                    uInt8Array[i] = raw.charCodeAt(i);
                }

                return new Blob([uInt8Array], { type: contentType });
            } catch (error) {
                console.error("Base64'ten Blob'a dönüştürme hatası:", error);
                return null;
            }
        }

        // Blob'u dosyaya çeviren fonksiyon
        function blobToFile(blob) {
            if (!blob) {
                console.error("Geçersiz blob verisi");
                return null;
            }
            const fileName = `profile_${Date.now()}.jpg`;
            return new File([blob], fileName, { type: 'image/jpeg' });
        }

        // Fotoğraf seçildiğinde
        imageInput.addEventListener("change", function (event) {
            const file = event.target.files[0];
            if (!file) {
                console.warn("Dosya seçilmedi");
                return;
            }

            // Dosya boyutu kontrolü (örn: 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert("Dosya boyutu 5MB'dan küçük olmalıdır");
                imageInput.value = "";
                return;
            }

            // Dosya tipi kontrolü
            if (!file.type.startsWith('image/')) {
                alert("Lütfen geçerli bir resim dosyası seçin");
                imageInput.value = "";
                return;
            }

            const reader = new FileReader();
            reader.onerror = function() {
                console.error("Dosya okuma hatası");
                alert("Dosya okunamadı");
            };
            reader.onload = function (e) {
                cropperImage.src = e.target.result;
                const modal = new bootstrap.Modal(modalElement);
                modal.show();

                modalElement.addEventListener("shown.bs.modal", function () {
                    if (cropper) {
                        cropper.destroy();
                    }
                    try {
                        cropper = new Cropper(cropperImage, {
                            aspectRatio: 1,
                            viewMode: 2,
                        });
                    } catch (error) {
                        console.error("Cropper başlatma hatası:", error);
                        modal.hide();
                    }
                });
            };
            reader.readAsDataURL(file);
        });

        // Kırpma onaylandığında
        confirmCropButton.addEventListener("click", function () {
            if (!cropper) {
                console.error("Cropper başlatılmamış");
                return;
            }

            try {
                const canvas = cropper.getCroppedCanvas({
                    width: 300,
                    height: 300,
                });

                canvas.toBlob(function(blob) {
                    if (!blob) {
                        console.error("Blob oluşturulamadı");
                        return;
                    }

                    const file = blobToFile(blob);
                    if (!file) {
                        console.error("Dosya oluşturulamadı");
                        return;
                    }

                    const formData = new FormData();
                    formData.append('profile_image', file);

                    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
                    if (!csrfToken) {
                        console.error("CSRF token bulunamadı");
                        return;
                    }

                    // Resmi geçici olarak yükle
                    fetch('/sis/upload-temp-image/', {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'X-CSRFToken': csrfToken.value,
                        }
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Sunucu yanıtı başarısız');
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data.success) {
                            tempImagePath = data.temp_path;
                            previewImage.src = data.url;
                            hiddenInput.value = data.temp_path;
                        } else {
                            throw new Error(data.message || 'Bilinmeyen hata');
                        }
                    })
                    .catch(error => {
                        console.error('Yükleme hatası:', error);
                        alert('Resim yüklenirken bir hata oluştu');
                    });
                }, 'image/jpeg', 0.9);

                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                modalInstance.hide();
            } catch (error) {
                console.error("Kırpma işlemi hatası:", error);
                alert("Resim kırpma işlemi başarısız oldu");
            }
        });

        // İptal edildiğinde
        cancelCropButton.addEventListener("click", function () {
            if (cropper) {
                cropper.destroy();
                cropper = null;
            }
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();
        });

        // Temizle butonuna basıldığında
        window.removeImage = function () {
            if (tempImagePath) {
                try {
                    fetch(`/sis/delete-temp-image/?temp_path=${tempImagePath}`, {
                        method: 'DELETE',
                        headers: {
                            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                        }
                    }).catch(error => console.error('Geçici dosya silme hatası:', error));
                    tempImagePath = null;
                } catch (error) {
                    console.error("Temizleme hatası:", error);
                }
            }

            previewImage.src = "/static/assets/img/default_user.png";
            hiddenInput.value = "";
            imageInput.value = "";
            if (cropper) {
                cropper.destroy();
                cropper = null;
            }
        };

        // Sayfa kapanırken veya yenilenirken geçici dosyayı temizle
        window.addEventListener('beforeunload', function() {
            if (tempImagePath) {
                try {
                    navigator.sendBeacon(
                        `/sis/delete-temp-image/?temp_path=${tempImagePath}`,
                        JSON.stringify({})
                    );
                } catch (error) {
                    console.error("Geçici dosya temizleme hatası:", error);
                }
            }
        });
    }

    // DOMContentLoaded olduğunda, eğer container bulunuyorsa otomatik olarak çalıştırıyoruz.
    document.addEventListener("DOMContentLoaded", function () {
        try {

            const container = document.querySelector('#imageCropperModal')?.closest('.form-group');

            if (container) {
                initializeCustomImageUpload(container);
            }
        } catch (error) {
            console.error("Başlatma hatası:", error);
        }
    });

    // Fonksiyonu dışa aktaralım
    return initializeCustomImageUpload;
}));

// Eğer ES6 modülleri kullanıyorsanız, default export tanımlaması yapın:
export default initializeCustomImageUpload;
