// Toast bildirimleri için yardımcı fonksiyon
function showToast(message, type = 'success') {
    Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        icon: type,
        title: message
    });
}

// Modal yönetimi için class yapısı
class DepartmentModalManager {
    constructor() {
        this.currentDepartmentId = null;
        this.departmentModal = new bootstrap.Modal(document.getElementById('departmentModal'));
        this.deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Form submit olayını dinle
        $(document).on('submit', '#departmentForm', (e) => this.handleFormSubmit(e));
        
        // Modal kapandığında formu temizle
        $('#departmentModal').on('hidden.bs.modal', () => {
            document.getElementById('modalBody').innerHTML = '';
            this.currentDepartmentId = null;
        });
    }

    async loadModalContent(url) {
        try {
            const response = await fetch(url + '?modal=true');
            if (!response.ok) throw new Error('Network response was not ok');
            
            const html = await response.text();
            document.getElementById('modalBody').innerHTML = html;
            
            this.initializeFormElements();
            this.departmentModal.show();
            
            // Modal başlığını güncelle
            const modalTitle = document.getElementById('modalTitle');
            modalTitle.textContent = this.currentDepartmentId ? 'Departman Düzenle' : 'Yeni Departman';
        } catch (error) {
            console.error('Error:', error);
            showToast('İçerik yüklenirken bir hata oluştu', 'error');
        }
    }

    initializeFormElements() {
        $('.select2').select2({
            dropdownParent: $('#departmentModal'),
            width: '100%',
            language: 'tr',
            placeholder: 'Seçiniz...'
        });
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        try {
            const url = this.currentDepartmentId ? 
                `/owner/service-departments/${this.currentDepartmentId}/update/` : 
                '/owner/service-departments/create/';

            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            const data = await response.json();

            if (data.success) {
                showToast(data.message || 'İşlem başarıyla tamamlandı');
                this.departmentModal.hide();
                window.location.reload();
            } else {
                this.handleFormErrors(data.errors);
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Bir hata oluştu', 'error');
        }
    }

    handleFormErrors(errors) {
        // Önceki hata mesajlarını temizle
        $('.invalid-feedback').remove();
        $('.is-invalid').removeClass('is-invalid');

        Object.entries(errors).forEach(([field, messages]) => {
            const input = document.querySelector(`[name="${field}"]`);
            if (input) {
                input.classList.add('is-invalid');
                const feedback = document.createElement('div');
                feedback.className = 'invalid-feedback';
                feedback.textContent = messages.join(' ');
                input.parentNode.appendChild(feedback);
            }
        });
    }

    async confirmDelete() {
        if (!this.currentDepartmentId) return;

        try {
            const response = await fetch(`/owner/service-departments/${this.currentDepartmentId}/delete/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (response.ok) {
                showToast('Departman başarıyla silindi');
                this.deleteModal.hide();
                window.location.reload();
            } else {
                throw new Error('Silme işlemi başarısız oldu');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Silme işlemi sırasında bir hata oluştu', 'error');
        }
    }
}

// Sayfa yüklendiğinde modal yöneticisini başlat
const modalManager = new DepartmentModalManager();

// Global fonksiyonları tanımla
window.openDepartmentModal = () => {
    modalManager.currentDepartmentId = null;
    modalManager.loadModalContent('/owner/service-departments/create/');
};

window.openEditModal = (id) => {
    modalManager.currentDepartmentId = id;
    modalManager.loadModalContent(`/owner/service-departments/${id}/update/`);
};

window.openDeleteModal = (id) => {
    modalManager.currentDepartmentId = id;
    modalManager.deleteModal.show();
};

window.confirmDelete = () => modalManager.confirmDelete();