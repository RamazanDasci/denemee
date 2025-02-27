import { DataTableManager } from '../datatableManager.js';

const tableManager = new DataTableManager({
    tableSelector: '#courseTable',
    key: 'course',
    editEndpoint: '/sis/course/update/',
    buttonOptions: { 
        isVisible: true, 
        buttonName: "Kurs Ekle", 
        popupUrl: "/sis/course/add/" 
    },
    apiEndpoint: '/api/v1/courses/',
    columns: [
        {
            data: null,
            className: 'text-center',
            orderable: false,
            render: (data, type, row, meta) => {
                const pageInfo = $('#courseTable').DataTable().page.info();
                return pageInfo.start + meta.row + 1; 
            },
            width: "10px",
            title: 'No'
            
        },
        
        {
            data: 'name',
            orderable: true,
            name: 'name',
            title: 'Kurs Adı'
        },
        {
            data: 'code',
            orderable: true,
            name: 'code',
            title: 'Kurs Kodu'
        },
        {
            data: 'branch_display',
            orderable: true,
            name: 'branch_display',
            title: 'Alan'
        },
        {
            data: 'language_display',
            orderable: true,
            name: 'language_display',
            title: 'Dil'
        },
        {
            data: 'weeklyHours',
            orderable: true,
            name: 'weeklyHours',
            title: 'Haftalık Saat'
        },
        {
            data: 'credit',
            render: (data) => data ? `${data} Kredi` : '-',
            orderable: true,
            name: 'credit',
            title: 'Kredi'
        },
        {
            data: 'compulsory',
            render: (data) => data ? 'Zorunlu' : 'Seçmeli',
            orderable: true,
            name: 'compulsory',
            title: 'Zorunlu'
        },
        {
            data: 'unit_name',
            orderable: true,
            name: 'unit_name',
            title: 'Birim'
        },
        {
            data: 'description',
            orderable: true,
            name: 'description',
            title: 'Açıklama'
        },
        {
            data: null,
            render: (row) => tableManager.renderActionColumn(row),
            orderable: false,
            width: "10px",
            title: 'Aksiyonlar'

        },
    ]
});
