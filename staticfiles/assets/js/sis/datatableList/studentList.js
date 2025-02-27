
import { DataTableManager } from '../datatableManager.js';

const tableManager = new DataTableManager({
    tableSelector: '#studentTable',
    key: 'student',
    editEndpoint: '/sis/student/update/', // Düzenleme sayfasının URL'si DÜZENLENECEKKKK
    apiEndpoint: '/api/v1/student-profiles/',
    buttonOptions: { 
        isVisible: true, 
        buttonName: "Öğrenci Ekle", 
        popupUrl: "/sis/student/create/popup/" 
    },
    // filters: {
    //     status: {
    //         label: 'Durum', 
    //         values: [
    //             { value: 'active', label: 'Aktif' },
    //             { value: 'inactive', label: 'Pasif' },
    //             { value: 'pending', label: 'Beklemede' },
    //             { value: 'new_interview', label: 'Yeni Görüşme' }
    //         ],
    //         type: 'select', // Tür: select, checkbox, radio, text
    //         multiple: false, // Çoklu seçim destekleniyor mu?
    //         placeholder: 'Durum seçin'
    //     },
    //     category: {
    //         label: 'Kategori',
    //         values: [
    //             { value: 'A', label: 'Kategori A' },
    //             { value: 'B', label: 'Kategori B' },
    //             { value: 'C', label: 'Kategori C' }
    //         ],
    //         type: 'select',
    //         multiple: true,
    //         placeholder: 'Kategori seçin'
    //     },
    //     dateRange: {
    //         label: 'Tarih Aralığı',
    //         type: 'daterange', // Tarih aralığı filtresi
    //         placeholder: 'Tarih aralığı seçin'
    //     },
    //     keyword: {
    //         label: 'Anahtar Kelime',
    //         type: 'text', // Metin girişi
    //         placeholder: 'Anahtar kelime girin'
    //     }
    // },
    
    columns: [
        {
            data: null,
            className: 'text-center',
            orderable: false,
            render: (data, type, row, meta) => {
                const pageInfo = $('#studentTable').DataTable().page.info();
                return pageInfo.start + meta.row + 1;
            },
            width: "10px",
            title: 'No'
        },
        {
            data: 'academic_info.school_number',
            orderable: true,
            name: 'academic_info__school_number',
            className: "no-sort",
            width: "10px",
            title: 'Okul Numarası'
        },
        {
            data: 'user',
            render: (data, type, row) => tableManager.renderUserColumn(data, row),
            orderable: true,
            name: 'user__first_name',
            title: 'Öğrenci Adı'
        },
        {
            data: 'academic_info.education_unit_display',
            orderable: true,
            name: 'academic_info__education_unit__name',
            title: 'Eğitim Birimi'
        },
        {
            data: 'academic_info.classroom_display',
            orderable: true,
            name: 'academic_info__classroom__name',
            title: 'Sınıf'
        },
        {
            data: 'academic_info.class_level_display',
            orderable: true,
            name: 'academic_info__class_level',
            title: 'Sınıf Seviyesi'
        },
        {
            data: 'academic_info.entry_date',
            render: (data) => data ? new Date(data).toLocaleDateString('tr-TR') : '',
            orderable: true,
            name: 'academic_info__entry_date',
            title: 'Giriş Tarihi'
        },
        
        {
            data: 'status',
            render: (data) => {
                const statusMap = {
                    'active': { text: 'Aktif', class: 'bg-success' },
                    'new_interview': { text: 'Yeni Görüşme', class: 'bg-warning' },
                    'pending': { text: 'Beklemede', class: 'bg-info' },
                    'inactive': { text: 'Pasif', class: 'bg-danger' },
                    'renewal': { text: 'Yenileme', class: 'bg-primary' },
                };

                const { text, class: statusClass } = statusMap[data] || { text: 'Bilinmeyen Durum', class: 'bg-secondary' };

                return `<span class="badge ${statusClass} rounded-pill">${text}</span>`;
            },
            orderable: false,
            className: "no-sort",
            name: 'status',
            width: "10px",
            title: 'Durum'
        },
        {
            data: null,
            render: (data) => tableManager.renderActionColumn(data),
            orderable: false,
            width: "10px",
            title: 'İşlemler',

        },
    ],
});
