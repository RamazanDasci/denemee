import { DataTableManager } from '../datatableManager.js';

const tableManager = new DataTableManager({
    tableSelector: '#lessonHourTable',
    key: 'lessonHour',
    editEndpoint: '/sis/lessonhour/update/',
    buttonOptions: { 
        isVisible: true, 
        buttonName: "Ders Saati Ekle", 
        popupUrl: "/sis/lessonhour/add/" 
    },
    apiEndpoint: '/api/v1/lesson-hours/',
    columns: [
        {
            data: null,
            className: 'text-center',
            orderable: false,
            render: (data, type, row, meta) => {
                const pageInfo = $('#lessonHourTable').DataTable().page.info();
                return pageInfo.start + meta.row + 1;
            },
            width: "10px",
            title: 'No',

            
        },
        {
            data: 'number',
            orderable: true,
            name: 'number',
            title: 'Saat No',
            className: 'text-center font-bold'
        },
        {
            data: 'start_time',
            orderable: true,
            name: 'start_time',
            title: 'Başlangıç Saati',
            render: (data) => `<span class="badge bg-success">${data}</span>`,
            className: 'text-center'
        },
        {
            data: 'end_time',
            orderable: true,
            name: 'end_time',
            title: 'Bitiş Saati',
            render: (data) => `<span class="badge bg-danger">${data}</span>`,
            className: 'text-center'
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
