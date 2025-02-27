import { DataTableManager } from '../datatableManager.js';

const tableManager = new DataTableManager({
    tableSelector: '#buildingTable',
    key: 'building',
    editEndpoint: '/sis/building/update/',
    buttonOptions: { 
        isVisible: true, 
        buttonName: "Bina Ekle", 
        popupUrl: "/sis/building/add/"
    },
    apiEndpoint: '/api/v1/buildings/',
    columns: [
        {
            data: null,
            className: 'text-center',
            orderable: false,
            render: (data, type, row, meta) => {
                const pageInfo = $('#buildingTable').DataTable().page.info();
                return pageInfo.start + meta.row + 1; 
            },
            width: "10px",
            title: 'No'
            
        },
        {
            data: 'name',
            orderable: true,
            name: 'name',
            title: 'Bina Adı'
        },
        {
            data: 'building_code',
            orderable: true,
            name: 'building_code',
            title: 'Bina Kodu'
        },
        {
            data: 'campus',
            orderable: true,
            name: 'campus',
            title: 'Kampüs'
        },
        {
            data: 'number_of_floors',
            orderable: true,
            name: 'number_of_floors',
            title: 'Kat Sayısı'
        },
        {
            data: 'total_area',
            orderable: true,
            name: 'total_area',
            title: 'Toplam Alan'
        },
        {
            data: 'year_built',
            orderable: true,
            name: 'year_built',
            title: 'İnşa Yılı'
        },
        {
            data: 'has_parking',
            render: (data) => data ? 'Evet' : 'Hayır',
            orderable: true,
            name: 'has_parking',
            title: 'Otopark'
        },
        {
            data: 'has_fire_safety',
            render: (data) => data ? 'Evet' : 'Hayır',
            orderable: true,
            name: 'has_fire_safety',
            title: 'Yangın Güvenliği'
        },
        {
            data: 'has_security',
            render: (data) => data ? 'Evet' : 'Hayır',
            orderable: true,
            name: 'has_security',
            title: 'Güvenlik'
        },
        {
            data: 'amenities',
            render: (data) => data ? data : '-',
            orderable: true,
            name: 'amenities',
            title: 'Ayrıcalıklar'
        },
        {
            data: 'status',
            render: (data) => `
                <span class="badge ${data ? 'bg-success' : 'bg-danger'} rounded-pill">
                    ${data ? 'Aktif' : 'Pasif'}
                </span>`,
            orderable: false,
            className: "no-sort",
            name: 'status',
            title: 'Durum',
            width: "10px"
        },
        {
            data: null,
            render: (row) => tableManager.renderActionColumn(row),
            orderable: false,
            width: "10px",
            title: 'Aksiyonlar'
        }
    ]
});
