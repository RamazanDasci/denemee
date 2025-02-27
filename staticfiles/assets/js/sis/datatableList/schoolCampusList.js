import { DataTableManager } from '../datatableManager.js';

window.tableManager = new DataTableManager({
    tableSelector: '#schoolCampusTable',
    key: 'schoolCampus',
    editEndpoint: '/sis/schoolcampus/update/',
    buttonOptions: { 
        isVisible: true, 
        buttonName: "Okul Kampüsü Ekle", 
        popupUrl: "/sis/schoolcampus/add/" 
    },
    apiEndpoint: '/api/v1/school-campuses/',
    columns: [
        {
            data: null,
            className: 'text-center',
            orderable: false,
            render: (data, type, row, meta) => {
                const pageInfo = $('#schoolCampusTable').DataTable().page.info();
                return pageInfo.start + meta.row + 1;
            },
            width: "10px",
            title: 'No'
            
        },
        {
            data: 'name',
            orderable: true,
            name: 'name',
            title: 'Kampüs Adı'
        },
        {
            data: 'school',
            orderable: true,
            name: 'school',
            title: 'Okul'
        },
        {
            data: 'established_year',
            orderable: true,
            name: 'established_year',
            title: 'Kuruluş Yılı'
        },
        {
            data: 'campus_size',
            orderable: true,
            name: 'campus_size',
            title: 'Kampüs Boyutu'
        },
        {
            data: 'phones',
            title: 'İletişim',
            orderable: false,
            render: function(phones, type, row) {
                const primaryPhone = phones.find(p => p.is_primary)?.phone_number || phones[0]?.phone_number || '-';
                const primaryEmail = row.emails.find(e => e.is_primary)?.email || row.emails[0]?.email || '-';
                return `<div>
                    <div><i class="ti ti-phone me-1"></i>${primaryPhone}</div>
                    <div><i class="ti ti-mail me-1"></i>${primaryEmail}</div>
                </div>`;
            }
        },
        {
            data: 'website',
            render: (data) => data ? `<a href="${data}" target="_blank">${data}</a>` : '-',
            orderable: true,
            name: 'website',
            title: 'Web Sitesi'
        },
        {
            data: 'status',
            render: (data) => `
                <span class="badge ${data ? 'bg-success' : 'bg-danger'} rounded-pill">
                    ${data ? 'Aktif' : 'Pasif'}
                </span>`,
            orderable: false,
            name: 'status',
            title: 'Durum',
            width: "10px"
        },
        {
            data: null,
            render: (data) => tableManager.renderActionColumn(data),
            orderable: false,
            width: "10px",
            title: 'Aksiyonlar'

        },
    ]
});

