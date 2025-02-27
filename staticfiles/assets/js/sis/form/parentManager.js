import initializeCustomImageUpload from '../../widgets/customImageUpload.js';
import ContactWidget from '../../widgets/contactWidgets.js';

let currentImageUploader = null;

class ParentManager {
    constructor() {
        // Modal'ı jQuery nesnesi olarak alıyoruz
        this.modal = $('#dynamicModal');
        this.form = null;
        this.useExistingUserToggle = null;
        this.existingUserSection = null;
        this.newUserFields = null;
        this.existingUserSelect = null;
        this.saveButton = null;
        // Öğrenci bilgilerini merkezi olarak tutmak için dizi
        this.students = [];
    }

    static getInstance() {
        if (!ParentManager.instance) {
            ParentManager.instance = new ParentManager();
        }
        return ParentManager.instance;
    }

    /**
     * Modalı açar ve formu yükler.
     * @param {HTMLElement} button - Modalı tetikleyen buton.
     */
    async openModal(button) {
        const url = button.dataset.action;
        const studentIdStr = button.dataset.studentId;  // Örneğin "215" veya "215,216"
        const parentId = button.dataset.parentId; // Düzenleme için

        // Öğrenci ID bilgisini diziye aktar (çoklu ID desteği)
        if (studentIdStr) {
            // Virgülle ayrılmış ID'leri alıp trim ederek diziye dönüştür
            this.students = studentIdStr.split(',').map(s => s.trim());
        } else {
            this.students = [];
        }

        try {
            // URL'e gerekli parametreleri ekle
            let fetchUrl = url;
            if (this.students.length > 0) {
                fetchUrl += (url.indexOf('?') !== -1 ? '&' : '?') + 'student_id=' + encodeURIComponent(this.students.join(','));
            }
            if (parentId) {
                fetchUrl += (fetchUrl.indexOf('?') !== -1 ? '&' : '?') + 'parent_id=' + encodeURIComponent(parentId);
            }

            const response = await fetch(fetchUrl);
            if (!response.ok) {
                throw new Error("HTML yüklenirken hata oluştu: " + response.status);
            }
            const html = await response.text();

            // Modal içeriğini güncelle
            this.modal.find('.modal-content').html(html);

            // Eğer düzenleme modundaysa, modal veri olarak parentId sakla
            if (parentId) {
                this.modal.data('parentId', parentId);
            } else {
                this.modal.removeData('parentId');
            }

            // Form elementleri ve diğer bileşenleri initialize et
            this.initializeForm();
        } catch (error) {
            console.error('Modal yükleme hatası:', error);
            this.showAlert('error', 'Hata', 'Form yüklenirken bir hata oluştu');
        }
    }

    /**
     * Formu ve ilgili widget'ları initialize eder.
     */
    initializeForm() {
        // Formu DOM'dan alıyoruz
        this.form = document.getElementById('parentForm');
        if (!this.form) {
            console.error("Form 'parentForm' bulunamadı.");
            return;
        }
        this.useExistingUserToggle = document.getElementById('useExistingUser');
        this.existingUserSection = document.getElementById('existingUserSection');
        this.newUserFields = document.getElementById('newUserFields');
        this.existingUserSelect = document.getElementById('existingUserSelect');
        this.saveButton = document.getElementById('saveParent');

        // Düzenleme moduna göre formu ayarlayın
        const parentId = this.modal.data('parentId');
        if (parentId) {
            this.form.dataset.parentId = parentId;
            this.form.dataset.formMethod = 'PUT';
            this.form.action = `/sis/parent/${parentId}/process/`;
        } else {
            this.form.dataset.formMethod = 'POST';
            this.form.action = `/sis/parent/process/`;
        }

        // Select2 initialize: mevcut kullanıcı select alanını jQuery ile başlatın
        if (this.existingUserSelect) {
            $(this.existingUserSelect).select2({
                placeholder: "Kullanıcı ara...",
                allowClear: true,
                width: '100%',
                dropdownParent: this.modal
            }).on('change', () => this.fillFormFromExistingUser());
        }
        // Select2 başlat: çoklu seçim alanı için
        const studentSelect = this.form.querySelector('[name="student"]');
        if (studentSelect) {
            $(studentSelect).select2({
                placeholder: "Öğrenci seçiniz...",
                allowClear: true,
                width: '100%',
                dropdownParent: this.modal
            });
        }

        // Toggle ve Save butonlarına event listener ekleyin
        if (this.useExistingUserToggle) {
            this.useExistingUserToggle.addEventListener('click', () => this.toggleUserSection());
        }
        if (this.saveButton) {
            this.saveButton.addEventListener('click', () => this.saveParent());
        }

        // ContactWidget initialize
        const widget = new ContactWidget();
        widget.initializeFromHiddenInputs();
        widget.init();

        // Image uploader initialize
        if (currentImageUploader) {
            currentImageUploader.destroy();
        }
        try {
            const imageUploadContainer = this.modal.find('.image-upload-container')[0];
            if (imageUploadContainer) {
                currentImageUploader = initializeCustomImageUpload(imageUploadContainer);
            } else {
                console.warn("Image uploader container bulunamadı.");
            }
        } catch (error) {
            console.error("Image uploader başlatma hatası:", error);
        }

        // Student alanı: Eğer formda öğrenci bilgisi varsa, müdahale edilemeyecek şekilde ayarla.
        const studentInput = this.form.querySelector('[name="student"]');
        console.log("Student input:", studentInput, studentInput ? studentInput.value : null);

        if (studentInput && this.students && this.students.length > 0) {
            if (this.students.length === 1) {
                // Tek öğrenci: select değerini ayarla.
                studentInput.value = this.students[0];
            } else {
                // Çoklu öğrenci: Öğrenci alanında virgülle ayrılmış şekilde göster.
                // (Alternatif olarak, bu alanı multi-select olarak da ayarlayabilirsiniz.)
                studentInput.value = this.students.join(', ');
            }
            
            // Öğrenci alanının müdahale edilememesi için hem HTML hem de select2 üzerinden disable edelim.
            studentInput.disabled = true;
            studentInput.style.cursor = 'not-allowed';
            studentInput.style.pointerEvents = 'none';

            // Eğer alan Select2 ile initialize edilmişse, Select2'nin disable durumunu güncelleyelim.
            if ($(studentInput).data('select2')) {
                $(studentInput).prop('disabled', true).trigger('change.select2');
            }
            
            // Form gönderimi sırasında bu değerin kaybolmaması için hidden input ekleyelim.
            let hiddenStudentInput = this.form.querySelector('input[name="student"][type="hidden"]');
            if (!hiddenStudentInput) {
                studentInput.parentElement.insertAdjacentHTML(
                    'beforeend',
                    `<input type="hidden" name="student" value='${JSON.stringify(this.students)}'>`
                );
            } else {
                hiddenStudentInput.value = JSON.stringify(this.students);
            }
        }
    }

    toggleUserSection() {
        const useExisting = this.useExistingUserToggle.checked;
        if (useExisting) {
            this.existingUserSection.classList.remove('d-none');
            this.newUserFields.classList.add('d-none');
        } else {
            this.existingUserSection.classList.add('d-none');
            this.newUserFields.classList.remove('d-none');
        }
        const newUserFieldsNames = ['first_name', 'last_name', 'email'];
        newUserFieldsNames.forEach(field => {
            const input = this.form.querySelector(`[name="${field}"]`);
            if (input) {
                input.required = !useExisting;
            }
        });
    }

    fillFormFromExistingUser() {
        const selectedOption = this.existingUserSelect.selectedOptions[0];
        if (selectedOption) {
            const userData = selectedOption.dataset;
            const fieldsMapping = {
                'firstName': 'first_name',
                'lastName': 'last_name',
                'email': 'email',
                'nationalId': 'national_id',
                'gender': 'gender',
                'dateOfBirth': 'date_of_birth'
            };
            Object.entries(fieldsMapping).forEach(([source, target]) => {
                const input = this.form.querySelector(`[name="${target}"]`);
                if (input && userData[source]) {
                    input.value = userData[source];
                    input.readOnly = true;
                }
            });
            const imagePreview = this.form.querySelector('.image-preview');
            if (imagePreview && userData.image) {
                imagePreview.style.backgroundImage = `url(${userData.image})`;
            }
        }
    }

    async saveParent() {
        try {
            const formData = new FormData(this.form);
            
            // Debug için form verilerini kontrol et
            console.log("Form verileri gönderilmeden önce:");
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            // Student ID'yi formData'ya ekle
            if (this.students && this.students.length > 0) {
                formData.set('student', this.students.join(','));
            }

            // İstek metodunu ve URL'i belirle
            const parentId = this.modal.data('parentId');
            const method = parentId ? 'PUT' : 'POST';
            const url = this.form.action;

            // İletişim bilgilerini JSON formatına çevir
            const emailsValues = this.form.querySelector('[name="emailsValues"]').value;
            const phonesValues = this.form.querySelector('[name="phonesValues"]').value;
            const addressesValues = this.form.querySelector('[name="addressesValues"]').value;

            // PUT isteği için özel işlem
            let fetchOptions = {
                method: method,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': this.getCsrfToken()
                }
            };

            if (method === 'PUT') {
                // PUT isteği için form verilerini URLSearchParams olarak gönder
                const searchParams = new URLSearchParams();
                
                // Form verilerini ekle
                for (let [key, value] of formData.entries()) {
                    if (key !== 'image') { // Resim hariç tüm verileri ekle
                        searchParams.append(key, value);
                    }
                }

                // İletişim bilgilerini ekle
                if (emailsValues) searchParams.append('emailsValues', emailsValues);
                if (phonesValues) searchParams.append('phonesValues', phonesValues);
                if (addressesValues) searchParams.append('addressesValues', addressesValues);

                // Resim varsa multipart/form-data olarak gönder
                const imageFile = formData.get('image');
                if (imageFile && imageFile.size > 0) {
                    const multipartData = new FormData();
                    multipartData.append('image', imageFile);
                    
                    for (let [key, value] of searchParams.entries()) {
                        multipartData.append(key, value);
                    }
                    
                    fetchOptions.body = multipartData;
                } else {
                    fetchOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    fetchOptions.body = searchParams;
                }

                console.log("PUT isteği gönderiliyor:", {
                    url,
                    method,
                    headers: fetchOptions.headers,
                    bodyType: fetchOptions.body.constructor.name,
                    formData: Object.fromEntries(method === 'PUT' ? searchParams.entries() : formData.entries())
                });
            } else {
                // POST isteği için normal FormData kullan
                fetchOptions.body = formData;
            }

            const response = await fetch(url, fetchOptions);
            const result = await response.json();

            if (response.ok) {
                this.showAlert('success', 'Başarılı', 'Veli başarıyla kaydedildi');
                const bsModal = bootstrap.Modal.getInstance(this.modalElement);
                if (bsModal) {
                    bsModal.hide();
                }
                if (typeof updateSection === 'function') {
                    updateSection('#parentSection');
                }
            } else {
                this.showAlert('error', 'Hata', result.message || 'Kaydetme sırasında bir hata oluştu');
                console.error('Sunucu Hatası:', result);
                if (result.errors) {
                    this.displayFormErrors(result.errors);
                }
            }
        } catch (error) {
            console.error('Kaydetme hatası:', error);
            this.showAlert('error', 'Hata', 'Kaydetme sırasında bir hata oluştu');
        } finally {
            // Student select field'ı güncelle
            const studentSelect = this.form.querySelector('[name="student"]');
            if (studentSelect && $(studentSelect).data('select2')) {
                $(studentSelect).select2('destroy');
                $(studentSelect).select2({
                    disabled: true,
                    placeholder: "Öğrenci seçili",
                    width: '100%',
                    dropdownParent: this.modal
                });
            }
        }
    }

    // Form hata gösterimi için yardımcı metod
    displayFormErrors(errors) {
        // Mevcut hata mesajlarını temizle
        this.form.querySelectorAll('.invalid-feedback').forEach(el => el.remove());
        this.form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

        // Hataları göster
        Object.entries(errors).forEach(([field, messages]) => {
            const input = this.form.querySelector(`[name="${field}"]`);
            if (input) {
                input.classList.add('is-invalid');
                const feedback = document.createElement('div');
                feedback.className = 'invalid-feedback';
                feedback.textContent = Array.isArray(messages) ? messages[0] : messages;
                input.parentNode.appendChild(feedback);
            }
        });

        // Student alanını her durumda kilitle
        if (this.students && this.students.length > 0) {
            const studentInput = this.form.querySelector('[name="student"]');
            if (studentInput) {
                studentInput.disabled = true;
                studentInput.style.cursor = 'not-allowed';
                studentInput.style.pointerEvents = 'none';
                
                // Select2'yi güncelle
                if ($(studentInput).data('select2')) {
                    $(studentInput).select2('destroy');
                    $(studentInput).select2({
                        disabled: true,
                        placeholder: "Öğrenci seçili",
                        width: '100%',
                        dropdownParent: this.modal
                    });
                }
            }
        }
    }

    async deleteParent(url, targetSelector) {
        const result = await this.showConfirm('Emin misiniz?', 'Bu işlem geri alınamaz!');
        if (result.isConfirmed) {
            try {
                const response = await fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRFToken': this.getCsrfToken()
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    this.removeElement(targetSelector);
                    this.showAlert('success', 'Başarılı', data.message, true);
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                this.showAlert('error', 'Hata', error.message);
            }
        }
    }

    removeElement(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.style.transition = 'opacity 0.3s';
            element.style.opacity = '0';
            setTimeout(() => element.remove(), 300);
        }
    }

    showAlert(icon, title, text, isToast = false) {
        return Swal.fire({
            icon,
            title,
            text,
            toast: isToast,
            position: isToast ? 'top-end' : 'center',
            showConfirmButton: !isToast,
            timer: isToast ? 3000 : undefined,
            timerProgressBar: isToast
        });
    }

    showConfirm(title, text) {
        return Swal.fire({
            title,
            text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Evet, sil!',
            cancelButtonText: 'İptal'
        });
    }

    getCsrfToken() {
        const tokenElement = document.querySelector('[name=csrfmiddlewaretoken]');
        if (!tokenElement) {
            console.error("CSRF token bulunamadı.");
            return '';
        }
        return tokenElement.value;
    }

    refreshSection() {
        const section = document.querySelector('#parent-section');
        if (section) {
            location.reload();
        }
    }

    destroy() {
        if (this.existingUserSelect && $.fn.select2) {
            $(this.existingUserSelect).select2('destroy');
        }
    }
}

// Singleton instance oluştur
const parentManager = new ParentManager();

// Global metodları tanımla
window.ParentManager = {
    openModal: (button) => parentManager.openModal(button),
    deleteParent: (url, selector) => parentManager.deleteParent(url, selector)
};
