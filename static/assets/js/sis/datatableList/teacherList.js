import { DataTableManager } from '../datatableManager.js';

const tableManager = new DataTableManager({
    tableSelector: '#teacherTable',
    editEndpoint: '/sis/teacher/update/',
    apiEndpoint: '/api/v1/teacher-profiles/',
    buttonOptions: { 
        isVisible: true, 
        buttonName: "Öğretmen Ekle", 
        popupUrl: "/sis/teacher/add/" 
    },
    key: 'teacher',
    columns: [
        {
            data: null,
            className: 'text-center',
            orderable: false,
            render: (data, type, row, meta) => {
                const pageInfo = $('#teacherTable').DataTable().page.info();
                return pageInfo.start + meta.row + 1;
            },
            width: "10px",
            title: 'No'
        },
        
        {
            data: 'national_id',
            name: 'employee__user__population_infos__national_id',
            title: 'TC Kimlik No',
            render: function(data) {
                return data || '-';
            }
        },
        {
            data: 'user',
            render: (data, type, row) => tableManager.renderUserColumn(data, row),
            orderable: true,
            name: 'employee__user__first_name',
            title: 'Öğretmen'
        },
        
        {
            data: 'branch',
            name: 'branch',
            title: 'Branş',
            render: function(data) {
                return data || '-';
            }
        },
        {
            data: 'class_levels',
            name: 'class_levels',
            title: 'Sınıf Düzeyleri',
            render: function(data) {
                return Array.isArray(data) ? data.join(', ') : '-';
            }
        },
        {
            data: 'employee',
            name: 'employee__assignments',
            title: 'Görev Yeri',
            render: function(data) {
                if (!data || !data.assignments || !data.assignments.length) return '-';
                const primary = data.assignments.find(a => a.is_primary) || data.assignments[0];
                return `${primary.campus}<br><small>${primary.job}</small>`;
            }
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
            data: 'employee.start_date',
            name: 'employee__start_date',
            title: 'Başlangıç Tarihi',
            render: function(data) {
                return data ? moment(data).format('DD.MM.YYYY') : '-';
            }
        },
        {
            data: null,
            render: (data) => tableManager.renderActionColumn(data),
            orderable: false,
            width: "10px",
            title: 'Aksiyonlar'
        }
    ]
    

});


