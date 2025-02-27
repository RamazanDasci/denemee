let parents = [];
let modalInstance = null;
let currentModal = null;

// Ana başlatma fonksiyonu
function initializeParentWidgets() {
    initializeElements();
    
    // Modal kapanma olayını dinle
    if (currentModal) {
        currentModal.addEventListener('hidden.bs.modal', function () {
            // Hataları temizle
            const modalBody = currentModal.querySelector('.modal-body');
            if (modalBody) {
                // Hata sınıflarını kaldır
                modalBody.querySelectorAll('.is-invalid').forEach(el => {
                    el.classList.remove('is-invalid');
                });
                
                // Hata mesajlarını kaldır
                modalBody.querySelectorAll('.invalid-feedback').forEach(el => {
                    el.remove();
                });
                
                // Form verilerini sıfırla
                const inputs = modalBody.querySelectorAll('input, select, textarea');
                inputs.forEach(input => {
                    if (input.type === 'checkbox') {
                        input.checked = false;
                    } else {
                        input.value = '';
                    }
                });

                // Varsayılan değerleri ayarla
                const isDeceasedSelect = modalBody.querySelector('select[name="is_deceased"]');
                if (isDeceasedSelect) {
                    isDeceasedSelect.value = 'false';
                }

                const kinshipSelect = modalBody.querySelector('select[name="kinship_type"]');
                if (kinshipSelect) {
                    kinshipSelect.value = 'PARENT';
                }

                // Edit index'i temizle
                delete modalBody.dataset.editIndex;
            }
        });
    }

    // Birlikte oturuyor switch'ini dinle
    const parentModal = document.getElementById('parentModal');
    if (parentModal) {
        const coResidenceSwitch = parentModal.querySelector('input[name="co_residence"]');
        const addressFields = [
            'parent_city',
            'parent_district', 
            'parent_street',
            'parent_address'
        ];

        if (coResidenceSwitch) {
            coResidenceSwitch.addEventListener('change', function() {
                toggleAddressFields(this.checked, addressFields);
            });
        }
    }

    // Wizard formunda parent kontrolü ekle
    const wizardForm = document.getElementById('studentWizardForm');
    if (wizardForm) {
        wizardForm.addEventListener('submit', function(e) {
            const parentDataInput = document.getElementById('parentDataInput');
            const parentData = parentDataInput ? JSON.parse(parentDataInput.value || '[]') : [];
            
            if (parentData.length === 0) {
                e.preventDefault();
                showToast('error', 'En az bir veli eklemelisiniz');
                return false;
            }
        });
    }
}

// DOM yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', function() {
    initializeParentWidgets();
});

// Ajax ile yeniden başlatma fonksiyonu
window.reinitializeParentWidgets = function() {
    initializeParentWidgets();
};

function initializeElements() {
    currentModal = document.getElementById('parentModal');
    if (currentModal) {
        modalInstance = new bootstrap.Modal(currentModal);
    }
}

window.openParentModal = function(parentIndex = null) {
    if (!modalInstance) {
        initializeElements();
    }

    if (!currentModal) {
        console.error('Modal elementi bulunamadı');
        return;
    }

    modalInstance.show();

    // Modal açıldıktan sonra form işlemlerini yap
    setTimeout(() => {
        const modalBody = currentModal.querySelector('.modal-body');
        if (modalBody) {
            if (parentIndex !== null) {
                // Düzenleme modu
                const hiddenInput = document.getElementById('parentDataInput');
                const currentData = JSON.parse(hiddenInput.value || '[]');
                const parent = currentData[parentIndex];
                
                if (parent) {
                    modalBody.dataset.editIndex = parentIndex;
                    fillFormWithParentData(parent, modalBody);
                    
                    // Birlikte oturuyor durumuna göre adres alanlarını güncelle
                    const coResidenceSwitch = modalBody.querySelector('input[name="co_residence"]');
                    if (coResidenceSwitch) {
                        const addressFields = [
                            'parent_city',
                            'parent_district',
                            'parent_street',
                            'parent_address'
                        ];
                        toggleAddressFields(coResidenceSwitch.checked, addressFields);
                    }
                } else {
                    console.error('Veli verisi bulunamadı');
                }
            } else {
                // Yeni veli modu
                resetForm(modalBody);
            }
        }
    }, 300);
};

// Form resetleme fonksiyonu
function resetForm(modalBody) {
    if (!modalBody) return;

    // Tüm form elemanlarını sıfırla
    const inputs = modalBody.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (input.type === 'checkbox') {
            input.checked = false;
        } else {
            input.value = '';
        }
    });

    // Varsayılan değerleri ayarla
    const isDeceasedSelect = modalBody.querySelector('select[name="is_deceased"]');
    if (isDeceasedSelect) {
        isDeceasedSelect.value = 'false';
    }

    // Diğer toggle'ları true olarak ayarla
    const toggleInputs = modalBody.querySelectorAll('input[type="checkbox"]:not([name="is_deceased"])');
    toggleInputs.forEach(toggle => {
        toggle.checked = true;

    });
    const addressFields = [
        'parent_city',
        'parent_district', 
        'parent_street',
        'parent_address'
    ];
    toggleAddressFields(true, addressFields);

    const kinshipSelect = modalBody.querySelector('select[name="kinship_type"]');
    if (kinshipSelect) {
        kinshipSelect.value = 'PA';
    }

    delete modalBody.dataset.editIndex;
}

function fillFormWithParentData(parent, modalBody) {
    if (!modalBody || !parent) {
        console.error('Modal body veya veli verisi eksik', { modalBody, parent });
        return;
    }
    
    try {
        Object.keys(parent).forEach(key => {
            const input = modalBody.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = parent[key];
                } else {
                    input.value = parent[key];
                }
            }
        });
    } catch (error) {
        console.error('Form doldurma hatası:', error);
    }
}

window.saveParent = function() {
    const modalBody = document.querySelector('#parentModal .modal-body');
    if (!modalBody) return;

    const parentForm = modalBody.querySelector('.parent-form');
    if (!parentForm) return;
    
    // Validasyon için gerekli alanları kontrol et
    const requiredFields = parentForm.querySelectorAll('[data-required="true"]');
    let isValid = true;
    
    // Hata mesajlarını temizle
    parentForm.querySelectorAll('.invalid-feedback').forEach(el => el.remove());
    parentForm.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('is-invalid');
            
            // Hata mesajı ekle
            const feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            feedback.textContent = 'Bu alan zorunludur';
            field.parentNode.appendChild(feedback);
        }
    });

    // Email validasyonu
    const emailField = parentForm.querySelector('[name="parent_email"]');
    if (emailField && emailField.value && !isValidEmail(emailField.value)) {
        isValid = false;
        emailField.classList.add('is-invalid');
        const feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        feedback.textContent = 'Geçerli bir email adresi giriniz';
        emailField.parentNode.appendChild(feedback);
    }

    // Form geçerli değilse eksik alanları consola bas
    if (!isValid) {
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                console.log('Eksik alan:', field.name);
            }
        });
        if (emailField && emailField.value && !isValidEmail(emailField.value)) {
            console.log('Geçersiz email formatı:', emailField.value);
        }
    }
    if (!isValid) {
        showToast('error', 'Lütfen tüm zorunlu alanları doldurun');
        return;
    }

    // Form verilerini topla
    const parentData = {};
    parentForm.querySelectorAll('input, select, textarea').forEach(element => {
        if (element.type === 'checkbox') {
            parentData[element.name] = element.checked;
        } else if (element.value) {
            parentData[element.name] = element.value.trim();
        }
    });

    // Düzenleme modu kontrolü
    const editIndex = modalBody.dataset.editIndex;
    const hiddenInput = document.getElementById('parentDataInput');
    let currentData = [];
    
    try {
        currentData = JSON.parse(hiddenInput.value || '[]');
    } catch (error) {
        console.error('JSON parse hatası:', error);
        currentData = [];
    }

    if (editIndex !== undefined) {
        // Düzenleme modu
        currentData[editIndex] = parentData;
    } else {
        // Yeni veli ekleme
        currentData.push(parentData);
    }

    hiddenInput.value = JSON.stringify(currentData);
    updateParentListUI(currentData);

    // Modal'ı kapat
    const modal = bootstrap.Modal.getInstance(document.getElementById('parentModal'));
    if (modal) {
        modal.hide();
    }

    showToast('success', editIndex !== undefined ? 'Veli başarıyla güncellendi' : 'Veli başarıyla eklendi');
};

// Email validasyon fonksiyonu
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Parent listesini güncelleme fonksiyonu
function updateParentListUI(parents) {
    const parentList = document.getElementById('parentList');
    if (!parentList) return;

    parentList.innerHTML = ''; // Listeyi temizle
    parents.forEach((parent, index) => {
        appendParentToList(parent, index);
    });
}

function appendParentToList(parentData, index) {
    const parentList = document.getElementById('parentList');
    if (!parentList) return;

    const parentItem = document.createElement('div');
    parentItem.className = 'card mb-3 shadow-sm';
    parentItem.innerHTML = `
        <div class="card-body">
            <div class="row">
                <div class="col-md-8">
                    <div class="d-flex align-items-center mb-2">
                        <div class="bg-primary text-white rounded-circle p-2 me-2" style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-user"></i>
                        </div>
                        <h5 class="card-title mb-0">${parentData.parent_first_name} ${parentData.parent_last_name}</h5>
                    </div>
                    <div class="row g-2">
                        <div class="col-md-6">
                            <p class="mb-1">
                                <i class="fas fa-id-card text-primary me-1"></i>
                                <strong>T.C. No</strong> ${parentData.parent_identity_number || '-'}
                            </p>
                            <p class="mb-1">
                                <i class="fas fa-envelope text-primary me-1"></i>
                                <strong>E-posta:</strong> ${parentData.parent_email || '-'}
                            </p>
                            <p class="mb-1">
                                <i class="fas fa-phone text-primary me-1"></i>
                                <strong>Telefon:</strong> ${parentData.phone_number || '-'}
                            </p>
                            
                        </div>
                        <div class="col-md-6">
                        <p class="mb-1">
                                <i class="fas fa-briefcase text-primary me-1"></i>
                                <strong>Meslek:</strong> ${parentData.occupation || '-'}
                            </p>
                            <p class="mb-1">
                                <i class="fas fa-building text-primary me-1"></i>
                                <strong>Kurum:</strong> ${parentData.organization || '-'}
                            </p>
                            <p class="mb-1">
                                <i class="fas fa-home text-primary me-1"></i>
                                ${parentData.co_residence ? '<span class="badge bg-success">Öğrenci ile aynı adreste</span>' : '<span class="badge bg-secondary">Farklı adreste</span>'}
                            </p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 text-end d-flex align-items-start justify-content-end">
                    <button type="button" class="btn btn-primary btn-sm me-2" onclick="openParentModal(${index})">
                        <i class="fas fa-edit me-1"></i> Düzenle
                    </button>
                    <button type="button" class="btn btn-danger btn-sm" onclick="removeParent(${index})">
                        <i class="fas fa-trash me-1"></i> Sil
                    </button>
                </div>
            </div>
        </div>
    `;

    parentList.appendChild(parentItem);
}

// Parent silme fonksiyonu güncellendi
window.removeParent = function(index) {
    if (confirm('Bu veliyi silmek istediğinizden emin misiniz?')) {
        const hiddenInput = document.getElementById('parentDataInput');
        const currentData = JSON.parse(hiddenInput.value || '[]');
        currentData.splice(index, 1);
        hiddenInput.value = JSON.stringify(currentData);
        updateParentListUI(currentData);
        showToast('success', 'Veli başarıyla silindi');
    }
};

function updateHiddenInput() {
    const parentDataInput = document.getElementById('parentDataInput');
    if (parentDataInput) {
        parentDataInput.value = JSON.stringify(parents);
    }
}

window.deleteParent = function(index) {
    if (confirm('Bu veliyi silmek istediğinizden emin misiniz?')) {
        parents.splice(index, 1);
        updateParentListUI(parents);
        updateHiddenInput();
    }
};

// Adres alanlarını toggle et
function toggleAddressFields(isDisabled, fieldNames) {
    const parentModal = document.getElementById('parentModal');
    if (!parentModal) return;

    const parentAddressFields = parentModal.querySelector('#parentAddressFields');
    if (parentAddressFields) {
        if (isDisabled) {
            // Input alanlarını temizle ve devre dışı bırak
            const inputs = parentAddressFields.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.value = '';
                input.disabled = true;
            });

            // Varolan overlay ve bilgi yazısını kaldır
            const existingOverlay = parentAddressFields.querySelector('.bg-dark');
            const existingInfoText = parentAddressFields.querySelector('.text-white');
            if (existingOverlay) existingOverlay.remove();
            if (existingInfoText) existingInfoText.remove();

            // Tüm div'i karartan overlay ekle
            const overlay = document.createElement('div');
            overlay.className = 'position-absolute w-100 h-100 bg-dark rounded';
            overlay.style.opacity = '0.50';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.zIndex = '0';
            overlay.style.borderRadius = '8px';
            parentAddressFields.style.position = 'relative';
            parentAddressFields.appendChild(overlay);

            // Bilgi yazısı ekle
            const infoText = document.createElement('div');
            infoText.className = 'position-absolute w-100 text-center text-white';
            infoText.style.top = '50%';
            infoText.style.left = '50%';
            infoText.style.transform = 'translate(-50%, -50%)';
            infoText.style.zIndex = '1';
            infoText.innerHTML = 'Öğrenci adresi kullanılacak <br> <small>Eğer farklı bir adres belirtmek istiyorsanız, Birlikte Oturuyor seçeneğini Kapatınız.</small>';
            parentAddressFields.appendChild(infoText);

        } else {
            // Input alanlarını aktif et
            const inputs = parentAddressFields.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.disabled = false;
            });

            // Overlay ve bilgi yazısını kaldır
            const overlay = parentAddressFields.querySelector('.bg-dark');
            const infoText = parentAddressFields.querySelector('.text-white');
            if (overlay) overlay.remove();
            if (infoText) infoText.remove();
        }
    }

    // Kullanıcıya bilgi ver
    if (isDisabled) {
        showToast('info', 'Öğrenci adresi kullanılacak');
    }
}

// Toast mesajı gösterme fonksiyonu
function showToast(type, message) {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
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

// Toast container oluşturma
function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(container);
    return container;
}