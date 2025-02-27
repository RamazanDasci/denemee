import { DataTableManager } from '../datatableManager.js';

const tableManager = new DataTableManager({
    tableSelector: '#lessonCalendarTable',
    key: 'lessonCalendar',
    editEndpoint: '/sis/lessoncalendar/update/',
    buttonOptions: { 
        isVisible: true, 
        buttonName: "Ders Takvimi Ekle", 
        popupUrl: "/sis/lessoncalendar/add/" 
    },
    apiEndpoint: '/api/v1/lesson-calendars/',
    columns: [
        {
            data: null,
            className: 'text-center',
            orderable: false,
            render: (data, type, row, meta) => {
                const pageInfo = $('#lessonCalendarTable').DataTable().page.info();
                return pageInfo.start + meta.row + 1;
            },
            width: "10px",
            title: 'No',

            
        },
        {
            data: 'lesson_name',
            orderable: true,
            name: 'lesson_name',
            title: 'Ders Adı',
            className: 'text-center font-bold'
        },
        {
            data: 'class_room_name',
            orderable: true,
            name: 'class_room_name',
            title: 'Sınıf',
            className: 'text-center'
        },
        {
            data: 'day_display',
            orderable: true,
            name: 'day_display',
            title: 'Gün',
            render: (data) => `<span class="badge bg-info">${data}</span>`,
            className: 'text-center'
        },
        {
            data: 'lesson_time',
            orderable: true,
            name: 'lesson_time',
            title: 'Ders Saati No',
            className: 'text-center'
        },
        {
            data: 'start_time',
            orderable: false,
            name: 'start_time',
            title: 'Başlangıç Saati',
            render: (data) => data ? `<span>${data}</span>` : `<span class="text-muted">Belirtilmemiş</span>`,
            className: 'text-center'
        },
        {
            data: 'end_time',
            orderable: false,
            name: 'end_time',
            title: 'Bitiş Saati',
            render: (data) => data ? `<span>${data}</span>` : `<span class="text-muted">Belirtilmemiş</span>`,
            className: 'text-center'
        },
        {
            data: null,
            render: (row) => tableManager.renderActionColumn(row),
            orderable: false,
            width: "10px",
            title: 'Aksiyonlar'

        }
    ],
});
