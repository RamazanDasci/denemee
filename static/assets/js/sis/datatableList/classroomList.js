import { DataTableManager } from '../datatableManager.js';

const tableManager = new DataTableManager({
    tableSelector: '#classroomTable',
    key: 'employee', // BURADA EMPLOYEE DEMEMİN SEBEBİ USER SÜTUNUNDAKİ employee url ine ihtiyaç duyması
    editEndpoint: '/sis/classroom/update/',
    buttonOptions: { 
        isVisible: true, 
        buttonName: "Sınıf Ekle", 
        popupUrl: "/sis/classroom/add/" 
    },
    apiEndpoint: '/api/v1/classrooms/',
    columns: [
        {
            data: null,
            className: 'text-center',
            orderable: false,
            render: (data, type, row, meta) => {
                const pageInfo = $('#classroomTable').DataTable().page.info();
                return pageInfo.start + meta.row + 1;
            },
            width: "10px",
            title: 'No'
            
        },
        
        {
            data: 'name',
            name: 'name',
            title: 'Sınıf Adı',
            render: function(data) {
                return data || '-';
            }
        },
        {
            data: 'grade_level',
            name: 'grade_level',
            title: 'Seviye',
            render: function(data) {
                return data || '-';
            }
        },
        {
            data: 'advisor_teacher_info',
            name: 'advisor_teacher_info',
            title: 'Danışman Öğretmen',
            render: (data) => tableManager.renderUserColumn(data, data),
        },
        {
            data: 'unit_info',
            name: 'unit_info',
            title: 'Eğitim Birimi',
            render: function(data) {
                return data 
                    ? `${data.name || '-'} <br> (${data.unit_type || 'Tip Yok'})` 
                    : '-';
            }
        },
        {
            data: 'room_info',
            name: 'room_info',
            title: 'Oda',
            render: function(data) {
                return data 
                    ? `${data.name || '-'} <br> (Kod: ${data.room_code || '-'})` 
                    : '-';
            }
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
