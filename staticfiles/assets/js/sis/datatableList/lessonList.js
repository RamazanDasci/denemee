import { DataTableManager } from '../datatableManager.js';

const tableManager = new DataTableManager({
    tableSelector: '#lessonTable',
    key: 'lesson',
    editEndpoint: '/sis/lesson/update/',
    buttonOptions: { 
        isVisible: true, 
        buttonName: "Ders Ekle", 
        popupUrl: "/sis/lesson/add/" 
    },
    apiEndpoint: '/api/v1/lessons/',
    columns: [
        {
            data: null,
            className: 'text-center',
            orderable: false,
            render: (data, type, row, meta) => {
                const pageInfo = $('#lessonTable').DataTable().page.info();
                return pageInfo.start + meta.row + 1; 
            },
            width: "10px",
            title: 'No',
            title: 'Aksiyonlar'

            
        },
        {
            data: 'course_name',
            orderable: true,
            name: 'course_name',
            title: 'Kurs Adı'
        },
        {
            data: 'branch_name',
            orderable: true,
            name: 'branch_name',
            title: 'Şube'
        },
        {
            data: 'code',
            orderable: true,
            name: 'code',
            title: 'Ders Kodu'
        },
        {
            data: 'main_lesson',
            orderable: true,
            name: 'main_lesson',
            title: 'Ana Ders'
        },
        {
            data: 'description',
            orderable: true,
            name: 'description',
            title: 'Açıklama'
        },
        {
            data: 'weekly_hours',
            render: (data) => data ? `${data} Saat` : '-',
            orderable: true,
            name: 'weekly_hours',
            title: 'Haftalık Saat'
        },
        {
            data: 'teacher',
            orderable: true,
            name: 'teacher',
            title: 'Öğretmen ID'
        },
        {
            data: 'hide_portal',
            render: (data) => data ? 'Evet' : 'Hayır',
            orderable: true,
            name: 'hide_portal',
            title: 'Portaldan Gizli'
        },
        {
            data: 'summer_school',
            render: (data) => data ? 'Evet' : 'Hayır',
            orderable: true,
            name: 'summer_school',
            title: 'Yaz Okulu'
        },
        {
            data: 'language_display',
            orderable: true,
            name: 'language_display',
            title: 'Dil'
        },
        {
            data: 'medium_of_instruction_display',
            orderable: true,
            name: 'medium_of_instruction_display',
            title: 'Eğitim Ortamı'
        },
        {
            data: 'location_of_instruction_display',
            orderable: true,
            name: 'location_of_instruction_display',
            title: 'Eğitim Lokasyonu'
        },
        {
            data: 'start_week',
            orderable: true,
            name: 'start_week',
            title: 'Başlangıç Haftası'
        },
        {
            data: 'end_week',
            orderable: true,
            name: 'end_week',
            title: 'Bitiş Haftası'
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
