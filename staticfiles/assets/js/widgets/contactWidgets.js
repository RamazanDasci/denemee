// ContactWidget sınıfı tanımı
export default class ContactWidget {
    constructor() {
        // Veri yönetimi için state objesi
        this.widgetState = {
            addresses: [],
            emails: [],
            phones: [], 
            currentModal: null
        };
        // Sayfa yüklendiğinde hidden input'lardan verileri al
        this.initializeFromHiddenInputs();
    }

    // Hidden input'lardan başlangıç verilerini al
    initializeFromHiddenInputs() {
        ['addresses', 'emails', 'phones'].forEach(type => {
            const hiddenInput = document.querySelector(`input[name="${type}Values"]`);
            if (hiddenInput && hiddenInput.value) {
                try {
                    this.widgetState[type] = JSON.parse(hiddenInput.value);
                } catch (e) {
                    this.widgetState[type] = [];
                }
            }
        });
    }

    // Widget'ı başlat
    init(context = document) {
        this.initializeEventListeners(context);
        this.renderAllDropdowns(context);
    }

    // Event listener'ları başlat 
    initializeEventListeners(context) {
        // Dropdown dışına tıklanınca kapat
        document.addEventListener("click", (event) => {
            const dropdowns = document.querySelectorAll(".custom-dropdown-body.active");
            dropdowns.forEach(dropdown => {
                if (!dropdown.closest(".custom-dropdown-container").contains(event.target)) {
                    dropdown.classList.remove("active");
                }
            });
        });

        // Dropdown toggle
        document.querySelectorAll(".custom-dropdown-header").forEach(header => {
            header.addEventListener("click", (e) => {
                const container = e.target.closest(".custom-dropdown-container");
                const type = container.querySelector(".custom-dropdown-body").dataset.type;
                container.querySelector(".custom-dropdown-body").classList.toggle("active");
            });
        });

        // Yeni öğe ekleme butonları
        context.querySelectorAll(".add-item-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const type = btn.dataset.type;
                this.openEditModal(type);
            });
        });

        // Form submit olayını dinle
        document.addEventListener('submit', (event) => {
            const form = event.target;
            if (form.classList.contains('contact-form')) {
                event.preventDefault();
                this.saveModalData(form);
            }
        });
    }

    // Tüm dropdown'ları render et
    renderAllDropdowns(context) {
        ['addresses', 'emails', 'phones'].forEach(type => {
            this.renderDropdownItems(type, context);
        });
    }

    // Dropdown öğelerini oluşturma
    renderDropdownItems(type, context = document) {
        const dropdownBody = context.querySelector(`.custom-dropdown-body[data-type="${type}"]`);
        if (!dropdownBody) return;

        dropdownBody.innerHTML = ""; // Önceki öğeleri temizle
        const items = this.widgetState[type];

        if (items.length === 0) {
            const emptyMessage = document.createElement("div");
            emptyMessage.classList.add("alert", "alert-info", "dropdown-empty-message");
            emptyMessage.textContent = "Herhangi bir ekleme yapılmamış";
            dropdownBody.appendChild(emptyMessage);
            return;
        }

        items.forEach((item, index) => {
            const dropdownItem = document.createElement("div");
            dropdownItem.classList.add("dropdown-item");
            dropdownItem.setAttribute("data-index", index);

            // Düzenleme ikonu
            const editIcon = document.createElement("a");
            editIcon.classList.add("edit-icon", "text-primary", "border", "rounded", "fs-16", "p-1", "badge", "badge-primary-hover", "me-2");
            editIcon.innerHTML = '<i class="ti ti-edit-circle"></i>';
            editIcon.addEventListener("click", (e) => {
                e.stopPropagation();
                this.openEditModal(type, index);
            });
            dropdownItem.appendChild(editIcon);

            // Silme ikonu
            const deleteIcon = document.createElement("a");
            deleteIcon.classList.add("delete-icon", "text-danger", "border", "rounded", "fs-16", "p-1", "badge", "badge-danger-hover");
            deleteIcon.innerHTML = '<i class="ti ti-trash-x"></i>';
            deleteIcon.addEventListener("click", (e) => {
                e.stopPropagation();
                this.deleteItem(type, index);
            });
            dropdownItem.appendChild(deleteIcon);

            // Etiket
            const label = document.createElement("span");
            label.classList.add("option-label");
            label.textContent = this.getDisplayValue(item, type);
            dropdownItem.appendChild(label);

            // Checkbox
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.classList.add("select-checkbox");
            checkbox.checked = item.selected || false;
            checkbox.addEventListener("change", (e) => {
                e.stopPropagation();
                this.toggleSelection(type, index, e.target.checked);
            });
            dropdownItem.appendChild(checkbox);

            dropdownBody.appendChild(dropdownItem);
        });

        this.updateHiddenInput(type);
    }

    // Görüntülenecek değeri belirle
    getDisplayValue(item, type) {
        switch(type) {
            case 'addresses':
                return `${item.address_name}: ${item.address}`;
            case 'emails':
                return item.email;
            case 'phones':
                return item.phone_number;
            default:
                return '';
        }
    }

    // Hidden input'u güncelle
    updateHiddenInput(type) {
        const hiddenInput = document.querySelector(`input[name="${type}Values"]`);
        if (!hiddenInput) return;

        // Tüm verileri JSON olarak sakla, CSRF tokenini ve seçimi çıkart
        const dataWithoutCsrfAndSelection = this.widgetState[type].map(item => {
            const { csrfmiddlewaretoken, selected, ...rest } = item; // CSRF tokenini ve seçimi çıkar
            return rest;
        });
        hiddenInput.value = JSON.stringify(dataWithoutCsrfAndSelection);
    }

    // Öğe seçimini değiştir
    toggleSelection(type, index, isSelected) {
        this.widgetState[type][index].selected = isSelected;
        this.updateHiddenInput(type);
    }

    // Modal açma fonksiyonu
    async openEditModal(type, index = null) {
        const modalId = `${type}Modal`;
        const url = `/get-${type}-popup/`;
        
        try {
            const response = await fetch(url);
            const html = await response.text();
            
            const modalContainer = document.getElementById("dynamicModalContainer") || this.createModalContainer();
            modalContainer.innerHTML = html;
            
            const modal = new bootstrap.Modal(modalContainer.querySelector('.modal'));
            this.widgetState.currentModal = {
                type,
                index,
                modal
            };
            
            // Eğer düzenleme ise mevcut verileri doldur
            if (index !== null) {
                this.fillModalForm(type, index);
            }
           

            modal.show();
        } catch (error) {
            console.error("Modal yüklenirken hata:", error);
            this.showToast('error', 'Modal yüklenemedi');
        }
    }

    // Modal container oluştur
    createModalContainer() {
        const container = document.createElement("div");
        container.id = "dynamicModalContainer";
        document.body.appendChild(container);
        return container;
    }

    // Form verilerini kaydet
    saveModalData(form) {
        const type = form.dataset.type;
        const formData = new FormData(form);
        const data = {};
        
        // Form içindeki tüm input'ları topla
        form.querySelectorAll('input, textarea, select').forEach(input => {
            if (input.name) {
                // Checkbox için özel işlem
                if (input.type === 'checkbox' && input.name === 'is_primary') {
                    data[input.name] = input.checked;
                } else {
                    data[input.name] = input.value;
                }
            }
        });

        const index = this.widgetState.currentModal?.index;

        if (index != null) {  // index null veya undefined değilse (0, 1, 2... gibi bir sayı olmalı)
            // Düzenleme
            // Burada, dizide o indekste bir öğe varsa güncelleme yapılır.
            if (this.widgetState[type][index]) {
                this.widgetState[type][index] = { 
                    ...this.widgetState[type][index], 
                    ...data,
                    id: this.widgetState[type][index].id 
                };
            } else {
                // Eğer index tanımlı fakat dizide öğe bulunmuyorsa, hata mesajı verebilir veya yeni ekleme yapabilirsiniz.
                console.warn(`Güncelleme yapılacak öğe bulunamadı. index: ${index}`);
                data.id = Date.now();
                data.selected = false;
                this.widgetState[type].push(data);
            }
        } else {
            // Yeni ekleme
            data.id = Date.now();
            data.selected = false;
            this.widgetState[type].push(data);
        }

        // Hidden input'u güncelle
        this.updateHiddenInput(type);

        // Modal'ı kapat
        const modal = bootstrap.Modal.getInstance(form.closest('.modal'));
        if (modal) {
            modal.hide();
        }

        // Dropdown'ı güncelle
        this.renderDropdownItems(type);
        
        // Toast mesajı göster
        this.showToast('success', index !== null ? 'Başarıyla güncellendi' : 'Başarıyla eklendi');
    }

    // Düzenleme modalını doldur
    fillModalForm(type, index) {
        const item = this.widgetState[type][index];
        const form = document.querySelector(`.contact-form[data-type="${type}"]`);
        if (!form || !item) return;

        // Form alanlarını doldur
        Object.entries(item).forEach(([key, value]) => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input && key !== 'id' && key !== 'selected') {
                input.value = value;
            }
        });

        // Modal başlığını güncelle
        const titleElement = form.closest('.modal').querySelector('.modal-title span');
        if (titleElement) {
            titleElement.textContent = `${this.getTypeTitle(type)} Düzenle`;
        }
    }

    // Tip başlığını al
    getTypeTitle(type) {
        switch(type) {
            case 'addresses': return 'Adres';
            case 'emails': return 'E-posta';
            case 'phones': return 'Telefon';
            default: return '';
        }
    }

    // Öğe silme
    deleteItem(type, index) {
        Swal.fire({
            title: 'Emin misiniz?',
            text: 'Bu öğeyi silmek istediğinizden emin misiniz?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Evet, sil',
            cancelButtonText: 'İptal'
        }).then((result) => {
            if (result.isConfirmed) {
                this.widgetState[type].splice(index, 1);
                this.updateHiddenInput(type);
                this.renderDropdownItems(type);
                this.showToast('success', 'Başarıyla silindi');
            }
        });
    }

    // Toast mesajı göster
    showToast(type, message) {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: type === 'error' ? 'error' : 'success',
            title: message,
            showConfirmButton: false,
            timer: 3000
        });
    }

}

