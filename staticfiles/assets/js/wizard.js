let wizardInitialized = false;

document.addEventListener('DOMContentLoaded', function() {
    // DOM yüklendiğinde otomatik çalıştır
    const initialContainer = document.querySelector('#studentWizardForm');
    if (initialContainer) {
        initializeWizard(document);
    }

    // Modal açıldığında wizard'ı başlat
    const modal = document.getElementById('studentWizardModal');
    if (modal) {
        modal.addEventListener('shown.bs.modal', function() {
            const modalBody = document.getElementById('studentWizardForm');
            if (modalBody) {
                initializeWizard(modalBody);
            }
        });
    }
});

function initializeWizard(container) {
    if (wizardInitialized) return;
    // Form ve temel elementleri seç
    const form = container.querySelector('#studentWizardForm');
    const steps = container.querySelectorAll('.wizard-step');
    const panels = container.querySelectorAll('.wizard-panel');
    const progressBar = container.querySelector('.progress-bar');
    const prevButton = container.querySelector('#prevStep');
    const nextButton = container.querySelector('#nextStep');
    const submitButton = container.querySelector('#submitForm');

    let currentStep = 1;
    const totalSteps = steps.length;

    // Select2 başlat
    $(container).find('.select2').select2({
        width: '100%',
        placeholder: 'Seçiniz'
    });

    // Form submit event listener'ı
    function submitForm(e) {
        e.preventDefault();
        console.log("Form submit edildi");

        // Veli kontrolü
        const parentDataInput = container.querySelector('#parentDataInput');
        const parentData = parentDataInput ? JSON.parse(parentDataInput.value || '[]') : [];
        
        if (parentData.length === 0) {
            showToast('error', 'En az bir veli eklemelisiniz', container);
            return;
        }

        // Birlikte oturuyor kontrolü
        const hasCoResidenceParent = parentData.some(parent => parent.co_residence === true);
        if (!hasCoResidenceParent) {
            // Velilerden hiçbiri birlikte oturmuyor olarak işaretlenmediyse
            // Her velinin en az bir adresi olup olmadığını kontrol et
            const hasInvalidParent = parentData.some(parent => {
                return !parent.addresses || parent.addresses.length === 0;
            });

            if (hasInvalidParent) {
                showToast('error', 'Birlikte oturma seçeneği işaretlenmemiş veliler için en az bir adres girilmelidir', container);
                return;
            }
        }

        const formData = new FormData(form);
        formData.append('parent_data', parentDataInput.value);

        // Debug için form verilerini logla
        console.log("Gönderilecek veriler:");
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }

        fetch(form.action, {
            method: 'POST',
            headers: {
                'X-CSRFToken': container.querySelector('[name=csrfmiddlewaretoken]').value,
            },
            body: formData
        })
        .then(async response => {
            // Ham yanıtı al
            const rawResponse = await response.text();
            console.log('Ham sunucu yanıtı:', rawResponse);
            
            // Response başarılı mı kontrol et
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            try {
                // JSON parse etmeyi dene
                const data = JSON.parse(rawResponse);
                console.log('İşlenmiş yanıt:', data);
                
                if (data.success) {
                    showToast('success', data.message || 'Kayıt başarıyla tamamlandı', container);
                    
                    // Debug için student_id'yi logla
                    console.log('Oluşturulan öğrenci ID:', data.student_id);
                    
                    // Yönlendirme URL'i varsa kullan, yoksa student-list'e git
                    setTimeout(() => {
                        window.location.href = data.redirect_url || '/sis/student-list/';
                    }, 1500);
                } else {
                    throw new Error(data.message || 'İşlem başarısız');
                }
            } catch (parseError) {
                console.error('JSON parse hatası:', parseError);
                console.log('Parse edilemeyen yanıt:', rawResponse);
                
                // Eğer HTML yanıtı ise ve başarılı ise
                if (response.ok && rawResponse.includes('</html>')) {
                    showToast('success', 'Kayıt başarıyla tamamlandı', container);
                    setTimeout(() => {
                        window.location.href = response.url || '/sis/student-list';
                    }, 1500);
                } else {
                    throw new Error('Sunucu yanıtı işlenemedi');
                }
            }
        })
        .catch(error => {
            console.error('Detaylı hata bilgisi:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            showToast('error', `İşlem sırasında bir hata oluştu: ${error.message}`, container);
        });
    }

    function showToast(type, message, container) {
        let toastContainer = document.querySelector('#toastContainer');
        if (!toastContainer) {
            toastContainer = createToastContainer();
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : 'success'} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');

        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        toastContainer.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();

        setTimeout(() => toast.remove(), 3000);
    }

    function createToastContainer() {
        const toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        return toastContainer;
    }

    async function goToNextStep() {
        if (await validateCurrentStep()) {
            if (currentStep < totalSteps) {
                const currentPanel = panels[currentStep - 1];
                const nextPanel = panels[currentStep];

                currentPanel.style.display = 'none';
                nextPanel.style.display = 'block';

                steps[currentStep - 1].classList.remove('active');
                steps[currentStep].classList.add('active');

                const progress = ((currentStep + 1) / totalSteps) * 100;
                progressBar.style.width = `${progress}%`;

                currentStep++;

                prevButton.disabled = false;
                if (currentStep === totalSteps) {
                    nextButton.style.display = 'none';
                    submitButton.style.display = 'block';
                }
            }
        }
    }

    function goToPrevStep() {
        if (currentStep > 1) {
            panels[currentStep - 1].style.display = 'none';
            panels[currentStep - 2].style.display = 'block';

            steps[currentStep - 1].classList.remove('active');
            steps[currentStep - 2].classList.add('active');

            const progress = ((currentStep - 1) / totalSteps) * 100;
            progressBar.style.width = `${progress}%`;

            currentStep--;

            nextButton.style.display = 'block';
            submitButton.style.display = 'none';
            prevButton.disabled = currentStep === 1;
        }
    }

    async function validateCurrentStep() {
        const currentPanel = container.querySelector(`.wizard-panel[data-step="${currentStep}"]`);
        if (!currentPanel) {
            console.error("Panel bulunamadı!");
            return false;
        }

        // Step 1'de TC kontrolü yap
        if (currentStep === 1) {
            const nationalIdInput = currentPanel.querySelector('input[name="national_id"]');
            if (nationalIdInput && nationalIdInput.value) {
                try {
                    const response = await fetch(`/sis/check-national-id/?national_id=${nationalIdInput.value}`);
                    const data = await response.json();
                    
                    if (data.exists) {
                        showToast('error', data.message);
                        nationalIdInput.classList.add('is-invalid');
                        
                        // Hata mesajını input'un altında göster
                        let feedbackDiv = nationalIdInput.nextElementSibling;
                        if (!feedbackDiv || !feedbackDiv.classList.contains('invalid-feedback')) {
                            feedbackDiv = document.createElement('div');
                            feedbackDiv.className = 'invalid-feedback';
                            nationalIdInput.parentNode.appendChild(feedbackDiv);
                        }
                        feedbackDiv.textContent = data.message;
                        
                        return false;
                    }
                } catch (error) {
                    console.error('TC kontrol hatası:', error);
                    showToast('error', 'TC Kimlik numarası kontrolü sırasında bir hata oluştu');
                    return false;
                }
            }
        }

        const inputs = currentPanel.querySelectorAll('input[required], textarea[required]');
        const selects = currentPanel.querySelectorAll('select[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('is-invalid');
                input.closest('.form-group').classList.add('has-error');
            } else {
                input.classList.remove('is-invalid');
                input.closest('.form-group').classList.remove('has-error');
            }
        });

        selects.forEach(select => {
            if (!select.value) {
                isValid = false;
                if (select.classList.contains('select2')) {
                    const select2Container = select.nextElementSibling;
                    select2Container.classList.add('is-invalid');
                    select.closest('.form-group').classList.add('has-error');
                } else {
                    select.classList.add('is-invalid');
                    select.closest('.form-group').classList.add('has-error');
                }
            } else {
                if (select.classList.contains('select2')) {
                    const select2Container = select.nextElementSibling;
                    select2Container.classList.remove('is-invalid');
                    select.closest('.form-group').classList.remove('has-error');
                } else {
                    select.classList.remove('is-invalid');
                    select.closest('.form-group').classList.remove('has-error');
                }
            }
        });

        return isValid;
    }

    nextButton?.addEventListener('click', goToNextStep);
    prevButton?.addEventListener('click', goToPrevStep);
    submitButton?.addEventListener('click', submitForm);
}
