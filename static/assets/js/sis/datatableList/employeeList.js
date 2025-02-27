
import { DataTableManager } from '../datatableManager.js';

const tableManager = new DataTableManager({
    tableSelector: '#employeeTable',
    key: 'employee',
    editEndpoint: '/sis/employee/update/',
    buttonOptions: { 
        isVisible: true, 
        buttonName: "Çalışan Ekle", 
        popupUrl: "/sis/employee/add/" 
    },
    apiEndpoint: '/api/v1/employee-profiles/',
    columns: [
        {
            data: null,
            className: 'text-center',
            orderable: false,
            render: (data, type, row, meta) => {
                const pageInfo = $('#employeeTable').DataTable().page.info();
                return pageInfo.start + meta.row + 1; 
            },
            width: "10px",
            title: 'No',
            
            
        },
        
        {
            data: function(row) {
                return row.population_info?.national_id || '-';  // Optional chaining ile national_id al
            },
            title: 'TC Kimlik No',
            name: 'population_info__national_id',
        },
        {
            data: 'user',
            render: function (data, type, row) {
                // Kontrol: assignments listesinde "Teacher" var mı?
                const isTeacher = row.assignments.some(assignment => assignment.job === 'Öğretmen');
        
                // Detay sayfası URL'sini belirle
                const detailPageUrl = isTeacher 
                    ? `/sis/teacher/${row.id}/detail` 
                    : `/sis/employee/${row.id}/detail`;
        
                // Kullanıcı sütununu oluştur
                return `
                    <div class="d-flex align-items-center">
                        <div class="avatar avatar-sm me-2">
                            <img src="${data.image || '/static/assets/img/default_user.png'}" 
                                 class="avatar-img"
                                 alt="${data.first_name}"
                                 onerror="this.src='/static/assets/img/default_user.png'">
                        </div>
                        <div class="d-flex flex-column">
                            <a href="${detailPageUrl}" class="text-primary fw-medium mb-1">
                                ${data.first_name} ${data.last_name}
                            </a>
                        </div>
                    </div>`;
            },
            orderable: true,
            name: 'user__first_name',
            title: 'Çalışan'
        },
        {
            data: 'assignments',
            name: 'assignments',
            title: 'Görevler',
            render: function(data) {
                if (!data || !data.length) return '-';
                return data.map(a => a.is_primary ? `<strong>${a.job}</strong>` : a.job).join(', ');
            }
        },
        {
            data: null,
            name: 'assignments',
            title: 'Görev Yeri',
            render: function(data) {
                if (!data.assignments || !data.assignments.length) return '-';
                
                // İlk görev bilgisi alınır
                const firstAssignment = data.assignments[0];
                
                // Kampüs ve departman bilgisi gösterilir
                return `
                    <div>
                        <strong>${firstAssignment.campus || '-'}</strong><br>
                        <small>${data.department || 'Departman bilgisi yok'}</small>
                    </div>`;
            }
        },
        {
            data: 'phones',
            title: 'İletişim',
            orderable: false,
            render: function(phones, type, row) {
                const primaryPhone = phones.find(p => p.is_primary)?.phone_number || phones[0]?.phone_number || '-';
                const primaryEmail = row.emails.find(e => e.is_primary)?.email || row.emails[0]?.email || '-';
                return `
                    <div>
                        <div><i class="ti ti-phone me-1"></i>${primaryPhone}</div>
                        <div><i class="ti ti-mail me-1"></i>${primaryEmail}</div>
                    </div>`;
            }
        },
        {
            data: 'start_date',
            name: 'start_date',
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

        },

    ],

});
