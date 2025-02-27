
let currentImageUploader = null;

document.addEventListener('DOMContentLoaded', function() {
    // Dinamik form yükleme (modal içeriği için)
    $('#dynamicModal').on('show.bs.modal', function (event) {
        // Sadece tetikleyici (relatedTarget) varsa işlem yapıyoruz
        if (!event.relatedTarget) {
            return;
        }

        const button = $(event.relatedTarget);
        const url = button.data('action');
        const userId = button.data('userId');
        const section = button.data('section');
        const targetId = button.data('target');

        // Modalı jQuery nesnesi olarak kullanıyoruz
        const modal = $(this);
        modal.data('userId', userId);
        modal.data('section', section);
        modal.data('targetId', targetId);


        $.ajax({
            url: url,
            method: 'GET',
            success: function(response) {
                // Modal içeriğini güncelle
                modal.find('.modal-content').html(response);

                
            },
            error: function(xhr) {
                modal.find('.modal-content').html(
                    `<div class="alert alert-danger">Hata: ${xhr.responseText || 'İçerik yüklenemedi'}</div>`
                );
            }
        });
    });

    // Dinamik form gönderme (modal içindeki formlar)
    $(document).on('submit', '#dynamicEditForm', function(e) {
        e.preventDefault();
        const form = $(this);
        const formData = new FormData(this);
        const modal = $('#dynamicModal');
        const userId = modal.data('userId');
        const sectionId = modal.data('section');
        const targetId = modal.data('targetId');

        if(userId) {
            formData.append('user_id', userId);
        }

        $.ajax({
            url: form.attr('action'),
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if(response.status === 'success') {
                    // Resim yükleme bileşenini sıfırla
                    if(window.removeImage) {
                        window.removeImage();
                    }
                    modal.modal('hide');
                    updateSection(sectionId, targetId);
                    showToast('success', response.message);
                } else {
                    showToast('error', response.message || 'İşlem sırasında hata oluştu');
                }
            },
            error: function(xhr) {
                showToast('error', xhr.responseJSON?.message || 'Sunucu hatası oluştu');
            }
        });
    });

    // Silme işlemi için genel handler
    $(document).on('click', '.btn-delete', function(event) {
        event.preventDefault();
        const button = $(this);
        const url = button.data('action');
        const targetId = button.data('target');
        const sectionId = button.closest('.card-body').attr('id');

        Swal.fire({
            title: 'Silmek istediğinize emin misiniz?',
            text: "Bu işlem geri alınamaz!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Evet, sil!',
            cancelButtonText: 'Hayır, iptal et'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: url,
                    method: 'DELETE',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    success: function(response) {
                        if(response.status === 'success') {
                            $(targetId).fadeOut(300, function() {
                                $(this).remove();
                                showToast('success', response.message);
                            });
                        } else {
                            showToast('error', response.message || 'Silme işlemi başarısız');
                        }
                    },
                    error: function(xhr) {
                        console.error('Silme hatası:', xhr);
                        showToast('error', xhr.responseJSON?.message || 'Silme işlemi sırasında bir hata oluştu');
                    }
                });
            }
        });
    });

    // CSRF token'ı almak için yardımcı fonksiyon
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Bölüm güncelleme fonksiyonu
    function updateSection(sectionId, targetId = null) {
        $.get(window.location.href, function(data) {
            if (targetId) {
                const $newItem = $(data).find(targetId);
                if ($newItem.length) {
                    $(targetId).replaceWith($newItem);
                }
            } else {
                const $newContent = $(data).find(sectionId);
                if ($newContent.length) {
                    $(sectionId).html($newContent.html());
                }
            }
            reattachEventListeners();
        });
    }

    // Event listener'ları yeniden bağlama
    function reattachEventListeners() {
        $('[data-bs-toggle="modal"]').off('click').on('click', function() {
            const userId = $(this).data('userId');
            const section = $(this).data('section');
            const targetId = $(this).data('target');
            
            $('#dynamicModal')
                .data('userId', userId)
                .data('section', section)
                .data('targetId', targetId);
        });
        
        $('[data-bs-toggle="tooltip"]').tooltip();
    }

    // Toast bildirim fonksiyonu
    function showToast(type, message) {
        Swal.fire({
            icon: type,
            title: message,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });
    }

    // Modal kapanırken temizlik
    $('#dynamicModal').on('hidden.bs.modal', function () {
        if (currentImageUploader) {
            currentImageUploader.destroy();
            currentImageUploader = null;
        }
    });
});
