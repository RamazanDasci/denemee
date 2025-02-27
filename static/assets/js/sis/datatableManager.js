import ContactWidget from '../widgets/contactWidgets.js';


export class DataTableManager {
    constructor(options) {
        this.table = null;
        this.csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';
        this.tableSelector = options.tableSelector || '#dataTable';
        this.apiEndpoint = options.apiEndpoint || '/api/data/';
        this.key = options.key || '';
        this.editEndpoint = options.editEndpoint;
        this.filters = options.filters || {};
        this.columns = options.columns || [];
        this.languageSettings = options.languageSettings || this.getDefaultLanguageSettings();
        this.initOnLoad = options.initOnLoad !== false; // Varsayılan olarak tabloyu başlatır
        this.buttonOptions = options.buttonOptions || {};
        this.id = options.id || null;

        if (this.initOnLoad) {
            $(document).ready(() => {
                this.initializeDataTable();
                this.initializeEventListeners();
            });
        }
    }

    getDefaultLanguageSettings() {
        return {
            search: '',
            searchPlaceholder: 'Arama yap...',
            info: '_TOTAL_ kayıttan _START_ - _END_ arası gösteriliyor',
            infoEmpty: 'Gösterilecek kayıt bulunamadı',
            infoFiltered: '(_MAX_ kayıt içerisinden filtrelendi)',
            lengthMenu: '_MENU_ Kayıt Göster',
            zeroRecords: 'Eşleşen kayıt bulunamadı',
            paginate: {
                previous: '<i class="ti ti-chevron-left"></i>',
                next: '<i class="ti ti-chevron-right"></i>'
            }
        };
    }

    initializeDataTable() {
        const tableElement = $(this.tableSelector);
        if (!tableElement.length) {
            console.error(`Table element not found: ${this.tableSelector}`);
            return;
        }
    
        this.table = tableElement.DataTable({
            serverSide: true,
            processing: true,
            ajax: (data, callback, settings) => this.handleDataTableParams(data, callback, settings),
            columns: this.columns,
            order: [[1, 'asc']],
            pageLength: 10,
            lengthChange: true,
            searching: true,
            responsive: {
                details: {
                    renderer: (api, rowIdx, columns) => {
                        const data = columns
                            .map(col => col.hidden ? `<tr><td>${col.title}:</td><td>${col.data}</td></tr>` : '')
                            .join('');
                        return data ? `<table class="table">${data}</table>` : false;
                    }
                }
            },
            autoWidth: false,
            language: this.languageSettings,
            pagingType: "simple_numbers",
            dom: '<"row align-items-center"<"col-md-6 d-flex justify-content-start dataTable-custom-buttons"B><"col-md-6 d-flex justify-content-end"f>>' +
                 '<"row"<"col-12"tr>>' +
                 '<"row"<"col-md-5 d-flex justify-content-start"l><"col-md-7 d-flex justify-content-end"p>>',
            buttons: [
                {
                    extend: 'excelHtml5',
                    text: '<i class="ti ti-file-x"></i> Excel',
                    titleAttr: 'Excel olarak indir',
                    className: 'btn btn-primary btn-sm',
                },
                {
                    extend: 'pdfHtml5',
                    text: '<i class="ti ti-file"></i> PDF',
                    titleAttr: 'PDF olarak indir',
                    className: 'btn btn-primary btn-sm',
                },
                {
                    extend: 'print',
                    text: '<i class="ti ti-printer"></i> Yazdır',
                    titleAttr: 'Tabloyu yazdır',
                    className: 'btn btn-primary btn-sm',
                }
            ],
            drawCallback: () => {
                this.handleResponsiveRows();
            }
        });
    
        // Dinamik buton ekleme
        this.addCustomButton();
    }
    
    addCustomButton() {
        const customButtonContainer = document.querySelector('.dataTable-custom-buttons');
        if (!customButtonContainer) return;
    
        // Eğer buton görünmemesi gerekiyorsa, işlemi sonlandır
        if (!this.buttonOptions.isVisible) return;
    
        const button = document.createElement('button');
        button.className = 'btn btn-secondary btn-sm d-flex align-items-center me-2';
    
        const icon = document.createElement('i');
        icon.className = 'ti ti-square-rounded-plus'; // İkon sınıfı (gerekirse dinamik yapılabilir)
        icon.style.marginRight = '5px';
    
        button.appendChild(icon);
        button.appendChild(document.createTextNode(this.buttonOptions.buttonName)); // Dinamik isim
    
        button.style.order = -1; // Butonun sırası
    
        // Tıklama olayında dinamik popup açma
        button.addEventListener('click', () => this.handleCustomButtonClick(this.buttonOptions.popupUrl));
    
        customButtonContainer.insertBefore(button, customButtonContainer.firstChild);
    }

    
    handleCustomButtonClick(popupUrl, mode = "add", id = null) {
        if (id) {
            this.id = id;
        }
        const modalElement = document.querySelector("#dynamicModal");
        const modalContentElement = modalElement.querySelector("#modalContent");
        const modalTitleElement = modalElement.querySelector("#modalTitle");
    
        // Başlık ve URL'yi dinamik olarak ayarla
        const modalTitle = mode === "add" ? "Yeni Kayıt Ekle" : "Kaydı Düzenle";
        modalTitleElement.textContent = modalTitle;

        const modalUrl = mode === "edit" ? `${popupUrl}${id}/?modal=true` : `${popupUrl}?modal=true`;
        
        // Form action ve method ayarları
        this.formMethod = mode === "edit" ? "PUT" : "POST"; // Örnek olarak PUT ve POST kullanıldı


        // İçeriği yükle
        this.loadPopupContent(modalUrl, modalContentElement);
        
    
        // Bootstrap Modal'ı başlat ve davranışları kontrol et
        const bootstrapModal = new bootstrap.Modal(modalElement, {
            backdrop: "static", // Dışarıya tıklanmayı engelle
            keyboard: false, // Escape tuşu ile kapanmayı engelle
        });
    
        // Kapatma butonuna özel dinleyici ekleyin
        const closeButton = modalElement.querySelector(".btn-close");
        closeButton.removeEventListener("click", this.handleCloseEvent); // Eskiyi kaldır
        this.handleCloseEvent = (event) => {
            event.preventDefault(); // Varsayılan kapanmayı engelle
            this.confirmModalClose(bootstrapModal); // Onay iste
        };
        closeButton.addEventListener("click", this.handleCloseEvent);
    
        // Modalı göster
        bootstrapModal.show();
    }
    
    confirmModalClose(bootstrapModal) {
        // SweetAlert2 kullanarak onay mesajı
        Swal.fire({
            title: 'Emin misiniz?',
            text: "Tüm İlerleme Kaybolacak",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Evet, kapat!',
            cancelButtonText: 'Hayır, vazgeç',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                // Kullanıcı onayladıysa modal'ı kapat
                bootstrapModal.hide();
                
            } 
        });
    }
    
    loadPopupContent(url, container) {
        fetch(url)
        .then((response) => {
            if (!response.ok) throw new Error("HTML yüklenirken hata oluştu.");
            return response.text();
        })
        .then((html) => {
            container.innerHTML = html;
    
            // Varsayalım ki genel initializer'ınızı çağırıyorsunuz
            AppInitializer.init();
            const widget = new ContactWidget();
            
            // Eğer düzenleme (edit) modundaysanız ve form verileri varsa
            const form = container.querySelector("form");
            if (form && this.formMethod === 'PUT') { // "this.formMethod" edit modunu belirtiyor olmalı
                // İlgili endpoint'ten contact verilerini çekiyoruz
                fetch(`${this.editEndpoint}${this.id}/`)
                    .then(response => response.json())
                    .then(data => {
                        // E-posta verisi varsa, ilgili hidden inputa JSON string olarak atıyoruz
                        if (data.emails) {
                            const emailsInput = container.querySelector('input[name="emailsValues"]');
                            if (emailsInput) emailsInput.value = JSON.stringify(data.emails);
                        }
                        // Telefon verisi
                        if (data.phones) {
                            const phonesInput = container.querySelector('input[name="phonesValues"]');
                            if (phonesInput) phonesInput.value = JSON.stringify(data.phones);
                        }
                        // Adres verisi
                        if (data.addresses) {
                            const addressesInput = container.querySelector('input[name="addressesValues"]');
                            if (addressesInput) addressesInput.value = JSON.stringify(data.addresses);
                        }
                        
                        // Hidden inputlara atanan verilerden widget'ı güncelle
                        widget.initializeFromHiddenInputs();
                        widget.init();
                    })
                    .catch(error => console.error('Contact data fetch error:', error));
            } else {
                // Düzenleme modunda değilse veya form yoksa, sadece widget'ı başlatıyoruz
                widget.init();
            }
    
            // Form submit, iptal vs. işlemleri de burada bağlanıyor...
            const cancelButton = container.querySelector(".cancelButton");
            const modalElement = document.querySelector("#dynamicModal");
            const bootstrapModal = bootstrap.Modal.getInstance(modalElement);
            
            if (form) {
                const submitHandler = (event) => {
                    event.preventDefault();
                    this.submitFormAJAX(form);
                };
                form.addEventListener("submit", submitHandler);
    
                if (cancelButton) {
                    const cancelHandler = (event) => {
                        event.preventDefault();
                        this.confirmModalClose(bootstrapModal);
                    };
                    cancelButton.addEventListener("click", cancelHandler);
                    
                    modalElement.addEventListener("hidden.bs.modal", () => {
                        form.removeEventListener("submit", submitHandler);
                        cancelButton.removeEventListener("click", cancelHandler);
                    });
                }
            }
        })
        .catch((error) => {
            console.error("HTML yüklenemedi:", error);
            container.innerHTML = "<p>İçerik yüklenemedi. Lütfen tekrar deneyin.</p>";
        });
    }
    submitFormAJAX(form) {
        this.clearFormErrors(form);
        
        const formData = new FormData(form);


        const actionUrl = this.formMethod === 'PUT' ? 
            `${this.editEndpoint}${this.id}/` : 
            this.buttonOptions.popupUrl;

        fetch(actionUrl, {
            method: this.formMethod,
            body: formData,
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                "X-CSRFToken": this.csrfToken
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const modal = bootstrap.Modal.getInstance(
                    document.querySelector("#dynamicModal")
                );
                modal.hide();
                this.table.ajax.reload();
                this.showToast("İşlem başarıyla tamamlandı.", "success");
            } else {
                console.log('Form hataları:', data.errors);
                this.showFormErrors(form, data.errors);
                this.showToast("Formda hatalar var.", "error");
            }
        })
        .catch(error => {
            console.error("Hata:", error);
            this.showToast("Bir hata oluştu.", "error");
        });
    }


    // Hata göstergelerini temizle
    clearFormErrors(form) {
        // Tüm hata sınıflarını ve mesajlarını temizle
        form.querySelectorAll('.is-invalid').forEach(element => {
            element.classList.remove('is-invalid');
        });
        
        // Varsa önceki hata mesajlarını kaldır
        form.querySelectorAll('.invalid-feedback').forEach(element => {
            element.remove();
        });

        // Varsa önceki hata arka planlarını temizle
        form.querySelectorAll('.error-bg').forEach(element => {
            element.classList.remove('error-bg');
        });
    }

    // Form hatalarını göster
    showFormErrors(form, errors) {
        // Önce mevcut hataları temizle
        this.clearFormErrors(form);

        // Her hata için
        Object.entries(errors).forEach(([fieldName, errorMessages]) => {
            // Form elemanını bul
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                // Hata sınıfını ekle
                field.classList.add('is-invalid');
                
                // // Hata mesajı için container oluştur
                // const errorDiv = document.createElement('div');
                // errorDiv.className = 'invalid-feedback';
                // errorDiv.style.display = 'block'; // Görünür yap
                
                // // Hata mesajlarını ekle
                // if (Array.isArray(errorMessages)) {
                //     errorDiv.textContent = errorMessages.join(', ');
                // } else {
                //     errorDiv.textContent = errorMessages;
                // }

                // // Hata mesajını form elemanının yanına ekle
                // field.parentNode.appendChild(errorDiv);

                // // Hata mesajını animasyonlu olarak göster
                // setTimeout(() => {
                //     errorDiv.classList.add('show'); // Animasyonu başlat
                // }, 10); // Kısa bir gecikme ile animasyonu başlat

                // Form grubuna hata arka planı ekle
                const formGroup = field.closest('.form-group') || field.closest('.mb-3');
                if (formGroup) {
                    formGroup.classList.add('error-bg');
                }

                // Select2 için özel işlem
                if (field.classList.contains('select2')) {
                    const select2Container = field.nextElementSibling; // Select2'nin oluşturduğu container
                    if (select2Container) {
                        select2Container.classList.add('is-invalid'); // Select2 container'ına hata sınıfı ekle
                    }
                }
            }
        });
    }
    
    handleResponsiveRows() {
        const handleResize = () => {
            const tableRows = $(this.tableSelector).find('tbody tr');
            
            if (window.innerWidth <= 768) {
                tableRows.each((index, row) => {
                    const clickableArea = $(row).find('td:first-child');
                    const isAlreadyOpen = $(row).hasClass('dt-hasChild');

                    if (!isAlreadyOpen && clickableArea.length) {
                        clickableArea.trigger('click');
                    }
                });
            } 
        };
        $(window).on('resize', handleResize);

        $(document).ready(() => {
            handleResize();
        });
    }
    

    initializeEventListeners() {
        // Filtreleme formunu yönet
        $('#filterForm').on('submit', (e) => {
            e.preventDefault();
            this.updateFilters();
        });

        // Filtreleri sıfırla
        $('#resetFilters').on('click', () => {
            this.resetFilters();
        });

        
        // Tablodaki buton olaylarını dinle
        $(this.tableSelector).on('click', '.btn-edit', (e) => {
            const button = $(e.currentTarget);
            const id = button.data('id'); // Buton üzerindeki ID
            const endpoint = button.data('endpoint'); // Endpoint bilgisi
            this.handleCustomButtonClick(endpoint, 'edit', id);
        });
        
        $(this.tableSelector).on('click', '.btn-delete', (e) => {
            const button = $(e.currentTarget);
            const id = button.data('id');
            const endpoint = button.data('endpoint');
            this.handleDelete(id, endpoint);
        });
        
        // Tüm seçimleri yönet
        $('#select-all').on('click', (e) => this.handleSelectAll(e));
    }

    handleDataTableParams(data, callback, settings) {
        const params = {
            page: Math.floor(settings._iDisplayStart / settings._iDisplayLength) + 1,
            page_size: settings._iDisplayLength,
            ordering: this.getOrderingFromDataTable(settings),
            search: settings.oPreviousSearch.sSearch,
            ...this.filters
        };

        $.get(this.apiEndpoint, params)
            .done((response) => {
                callback({
                    recordsTotal: response.count,
                    recordsFiltered: response.count,
                    data: response.results
                });
            })
            .fail((error) => {
                console.error('Data fetch error:', error);
            });
    }

    getOrderingFromDataTable(settings) {
        if (settings.aaSorting.length > 0) {
            const columnIndex = settings.aaSorting[0][0];
            const columnName = settings.aoColumns[columnIndex].name;
            const direction = settings.aaSorting[0][1];
            return direction === 'desc' ? `-${columnName}` : columnName;
        }
        return '';
    }

    updateFilters() {
        const formData = new FormData($('#filterForm')[0]);
        for (const [key, value] of formData.entries()) {
            this.filters[key] = value;
        }
        this.table.ajax.reload();
    }

    resetFilters() {
        $('#filterForm')[0].reset();
        this.filters = {};
        this.table.ajax.reload();
    }

    handleSelectAll(e) {
        const rows = this.table.rows({ search: 'applied' }).nodes();
        $('input[type="checkbox"]', rows).prop('checked', e.target.checked);
    }

    showToast(message, icon = 'success') {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: icon,
            title: message,
            showConfirmButton: false,
            timer: 3000
        });
    }

    renderCheckboxColumn() {
        return `
            <div class="form-check">
                <input class="form-check-input" type="checkbox">
            </div>`;
    }

    renderActionColumn(row) {
        return `
            <div class="d-flex align-items-center">
                <button 
                    class="btn btn-outline-primary btn-sm me-2 btn-edit" 
                    data-id="${row.id}" 
                    data-endpoint="${this.editEndpoint}" 
                    data-mode="edit">
                    <i class="ti ti-pencil"></i>
                </button>
                <button 
                    class="btn btn-outline-danger btn-sm btn-delete" 
                    data-id="${row.id}" 
                    data-endpoint="${this.apiEndpoint}" 
                    data-key="${this.key}">
                    <i class="ti ti-trash"></i>
                </button>
            </div>
        `;
    }

    renderUserColumn (data, row) {
        return `
            <div class="d-flex align-items-center">
                <div class="avatar avatar-sm me-2">
                    <img src="${data.image || '/static/assets/img/default_user.png'}" 
                         class="avatar-img"
                         alt="${data.first_name}"
                         onerror="this.src='/static/assets/img/default_user.png'">
                </div>
                <div class="d-flex flex-column">
                    <a href="/sis/${this.key}/${row.id}/detail" class="text-primary fw-medium mb-1">
                        ${data.first_name} ${data.last_name}
                    </a>
                </div>
            </div>`;
    }


    
    
    handleDelete(id, endpoint) {
        const deleteEndpoint = `${endpoint}${id}/`;
    
        Swal.fire({
            title: 'Emin misiniz?',
            text: `Öğeyi silmek istediğinize emin misiniz?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Evet, sil',
            cancelButtonText: 'İptal'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: deleteEndpoint,
                    type: 'DELETE',
                    headers: {
                        'X-CSRFToken': this.csrfToken
                    },
                    success: () => {
                        this.showToast(`Başarıyla silindi!`);
                        this.table.ajax.reload();
                    },
                    error: (error) => {
                        this.showToast('Silme işlemi başarısız oldu!', 'error');
                        console.error('Delete error:', error);
                    }
                });
            }
        });
    }
}


