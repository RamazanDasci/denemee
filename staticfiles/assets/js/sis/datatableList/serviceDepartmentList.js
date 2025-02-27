
import { DataTableManager } from '../datatableManager.js';

const tableManager = new DataTableManager({
    tableSelector: '#serviceDepartmentTable',
    key: 'department',
    editEndpoint: '/sis/servicedepartments/update/',
    buttonOptions: { 
        isVisible: true, 
        buttonName: "Hizmet Bölümü Ekle", 
        popupUrl: "/sis/servicedepartments/add/"
    },
    apiEndpoint: '/api/v1/service-departments/',
    columns: [
        {
            data: null,
            className: 'text-center',
            orderable: false,
            render: (data, type, row, meta) => {
                const pageInfo = $('#serviceDepartmentTable').DataTable().page.info();
                return pageInfo.start + meta.row + 1;
            },
            width: "10px",
            title: 'No'
            
        },
        {
            data: 'name',
            orderable: true,
            name: 'name',
            title: 'Departman Adı'
        },

        {
            data: 'department_type_display',
            orderable: true,
            name: 'department_type',
            title: 'Departman Türü'
        },
        {
            data: 'school_name',
            orderable: true,
            name: 'school__name',
            title: 'Okul'
        },
        {
            data: 'campus_name',
            orderable: true,
            name: 'campus__name',
            title: 'Kampüs'
        },
        {
            data: 'rooms_names',
            render: (data) => data.length ? data.map(room => `<span class="badge badge-soft-primary me-1">${room}</span>`).join(' ') : '-',
            orderable: false,
            name: 'rooms__name',
            title: 'Odalar'
        },
        {
            data: 'responsible_person_name',
            render: (data) => data ? data : '-',
            orderable: true,
            name: 'responsible_person__first_name',
            title: 'Sorumlu Kişi'
        },
        {
            data: 'description',
            render: (data) => data ? data : '-',
            orderable: true,
            name: 'description',
            title: 'Açıklama'
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
            render: (data) => tableManager.renderActionColumn(data),
            orderable: false,
            width: "10px",
            title: 'Aksiyonlar'

        },
    ]
    
});

