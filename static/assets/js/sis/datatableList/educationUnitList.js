import { DataTableManager } from '../datatableManager.js';

const tableManager = new DataTableManager({
    tableSelector: '#educationUnitTable',
    key: 'educationUnit',
    editEndpoint: '/sis/educationunit/update/',
    apiEndpoint: '/api/v1/education-units/',
    buttonOptions: { 
        isVisible: true, 
        buttonName: "Eğitim Birimi Ekle", 
        popupUrl: "/sis/educationunit/add/" 
    },
    columns: [
        {
            data: null,
            className: 'text-center',
            orderable: false,
            render: (data, type, row, meta) => {
                const pageInfo = $('#educationUnitTable').DataTable().page.info();
                return pageInfo.start + meta.row + 1; 
            },
            width: "10px",
            title: 'No'
            
        },
        
        {
            data: 'name',
            orderable: true,
            name: 'name',
            render: (data) => data || '-',
            title: 'Eğitim Birimi Adı'
        },
        {
            data: 'unit_type',
            orderable: true,
            name: 'unit_type',
            title: 'Eğitim Birimi Türü',
            render: (data) => {
                const types = {
                    "primary": "İlköğretim",
                    "secondary": "Ortaöğretim",
                    "high": "Lise"
                };
                return types[data] || data || '-';
            }
        },
        {
            data: 'campus.name',
            orderable: true,
            name: 'campus__name',
            title: 'Kampüs Adı',
            render: (data) => data || '-'
        },
        {
            data: 'building',
            orderable: true,
            name: 'building__name',
            title: 'Bina Adı',
            render: (data, type, row) => row.building ? row.building.name : 'Belirtilmedi'
        },
        {
            data: 'status',
            render: (data) => `
                <span class="badge ${data ? 'bg-success' : 'bg-danger'} rounded-pill">
                    ${data ? 'Aktif' : 'Pasif'}
                </span>`,
            orderable: false,
            name: 'status',
            className: "no-sort",
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
    ],
});
