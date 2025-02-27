class BuildingModalManager {
    constructor() {
        this.currentBuildingId = null;
        this.buildingModal = new bootstrap.Modal(document.getElementById('buildingModal'));
        this.deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        $(document).on('submit', '#buildingForm', (e) => this.handleFormSubmit(e));
        
        $('#buildingModal').on('hidden.bs.modal', () => {
            document.getElementById('modalBody').innerHTML = '';
            this.currentBuildingId = null;
        });
    }

    async loadModalContent(url) {
        try {
            const response = await fetch(url + '?modal=true');
            if (!response.ok) throw new Error('Network response was not ok');
            
            const html = await response.text();
            document.getElementById('modalBody').innerHTML = html;
            
            this.initializeFormElements();
            this.buildingModal.show();
            
            const modalTitle = document.getElementById('modalTitle');
            modalTitle.textContent = this.currentBuildingId ? 'Bina Düzenle' : 'Yeni Bina';
        } catch (error) {
            console.error('Error:', error);
            showToast('İçerik yüklenirken bir hata oluştu', 'error');
        }
    }

    initializeFormElements() {
        $('.select2').select2({
            dropdownParent: $('#buildingModal'),
            width: '100%',
            language: 'tr'
        });

        // Switch elementlerini başlat
        $('[data-toggle="switch"]').bootstrapSwitch();
    }

    // Form gönderimi ve diğer metodlar serviceDepartments.js ile aynı mantıkta
    // ...
}

const modalManager = new BuildingModalManager();

window.openBuildingModal = () => {
    modalManager.currentBuildingId = null;
    modalManager.loadModalContent('/owner/buildings/create/');
};

window.openEditModal = (id) => {
    modalManager.currentBuildingId = id;
    modalManager.loadModalContent(`/owner/buildings/${id}/update/`);
};

window.openDeleteModal = (id) => {
    modalManager.currentBuildingId = id;
    modalManager.deleteModal.show();
};

window.confirmDelete = () => modalManager.confirmDelete(); 