import { DataTableManager } from '../datatableManager.js';

const tableManager = new DataTableManager({
    tableSelector: '#materialTable',
    key: 'material',
    editEndpoint: '/sis/material/update/',
    buttonOptions: { 
        isVisible: true, 
        buttonName: "Malzeme Ekle", 
        popupUrl: "/sis/material/add/" 
    },
    apiEndpoint: '/api/v1/materials/',
    columns: [
        {
            data: null,
            className: 'text-center',
            orderable: false,
            render: (data, type, row, meta) => {
                const pageInfo = $('#materialTable').DataTable().page.info();
                return pageInfo.start + meta.row + 1;
            },
            width: "10px",
            title: 'No'
            
        },
        {
            data: 'name',
            orderable: true,
            name: 'name',
            title: 'Malzeme Adı'
        },
        {
            data: 'material_code',
            orderable: true,
            name: 'material_code',
            title: 'Malzeme Kodu'
        },
        {
            data: 'material_type',
            orderable: true,
            name: 'material_type',
            title: 'Malzeme Türü'
        },
        {
            data: 'condition',
            render: (data) => data === 'new' ? 'Yeni' : 'Kullanılmış',
            orderable: true,
            name: 'condition',
            title: 'Durum'
        },
        {
            data: 'description',
            orderable: true,
            name: 'description',
            title: 'Açıklama'
        },
        {
            data: 'acquisition_date',
            orderable: true,
            name: 'acquisition_date',
            title: 'Alım Tarihi'
        },
        {
            data: 'price',
            render: (data) => data ? `${data} ₺` : '-',
            orderable: true,
            name: 'price',
            title: 'Fiyat'
        },
        {
            data: 'warranty_expiry',
            orderable: true,
            name: 'warranty_expiry',
            title: 'Garanti Bitiş Tarihi'
        },
        {
            data: 'department_name',
            orderable: true,
            name: 'department_name',
            title: 'Departman'
        },
        {
            data: 'location_name',
            orderable: true,
            name: 'location_name',
            title: 'Konum'
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
