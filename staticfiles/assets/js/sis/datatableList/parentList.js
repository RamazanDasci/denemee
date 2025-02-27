
import { DataTableManager } from '../datatableManager.js';

const tableManager = new DataTableManager({
    tableSelector: '#parentTable',
    key: 'parent',
    editEndpoint: '/sis/parent/update/',
    apiEndpoint: '/api/v1/parent-profiles/',
    buttonOptions: { 
        isVisible: true, 
        buttonName: "Veli Ekle", 
        popupUrl: "/sis/parent/add/" 
    },
    columns: [
        {
            data: null,
            className: 'text-center',
            orderable: false,
            render: (data, type, row, meta) => {
                const pageInfo = $('#parentTable').DataTable().page.info();
                return pageInfo.start + meta.row + 1;
            },
            width: "10px",
            title: 'No',
            
            
        },
        {
            data: 'national_id',
            orderable: true,
            name: 'user__username',
            className: "no-sort",
            width: "10px",
            render: function(data) {
                return data ? data : '-';
            },
            title: 'TC Kimlik No'
        },
        {
            data: 'user',
            render: (data, type, row) => tableManager.renderUserColumn(data, row),
            orderable: true,
            name: 'user__first_name',
            title: 'Veli'
        },
        {
            data: 'student',
            orderable: false,
            name: 'student',
            render: function(data, type, row) {
                if (type === 'display') {
                    let studentHtml = '';

                    data.forEach(student => {
                        const kinship = row.kinships.find(k => k.student === student.id);
                        const relationshipType = kinship ? kinship.get_type_display : '';
                        const profileImg = student.user.image 
                            ? `<img src="${student.user.image}" class="avatar avatar-sm" alt="${student.user.first_name}">`
                            : `<img src="/static/assets/img/default_user.png" class="avatar avatar-sm" alt="avatar">`;

                        studentHtml += `
                            <div class="d-flex align-items-center mb-2 flex-wrap">
                                <a href="/sis/student/${student.id}/detail/" class="d-flex align-items-center text-decoration-none">
                                    ${profileImg}
                                    <span class="ms-2">${student.user.first_name} ${student.user.last_name}</span>
                                </a>
                                ${relationshipType ? `<span class="text-muted ms-2">(${relationshipType})</span>` : ''}
                            </div>`;
                    });

                    return `<div class="student-list">${studentHtml}</div>`;
                }
                return data;
            },
            title: 'Öğrenci'
        },
        {
            data: 'phones',
            orderable: true,
            name: 'phone__phone_number',
            render: function(data) {
                if (!data || !Array.isArray(data) || data.length === 0) {
                    return '<span class="text-muted">-</span>';
                }

                return data.map(phones => `
                    <div class="d-flex align-items-center mb-1">
                        <i class="ti ${phones.type === 'mobile' ? 'ti-phone' : 'ti-phone-call'} me-2"></i>
                        <span class="${phones.is_primary ? 'fw-bold' : ''}">${phones.phone_number}</span>
                    </div>
                `).join('');
            },
            title: 'Telefon'
        },
        {
            data: 'emails',
            orderable: true,
            name: 'email__email',
            render: function(data) {
                if (!data || !Array.isArray(data) || data.length === 0) {
                    return '<span class="text-muted">-</span>';
                }

                return data.map(emails => `
                    <div class="d-flex align-items-center mb-1">
                        <i class="ti ti-mail me-2"></i>
                        <span class="${emails.is_primary ? 'fw-bold' : ''}">${emails.email}</span>
                    </div>
                `).join('');
            },
            title: 'E-posta'
        },
        {
            data: 'notify',
            render: (data) => `
                <span class="badge ${data ? 'bg-success' : 'bg-danger'} rounded-pill">
                    ${data ? 'Aktif' : 'Pasif'}
                </span>`,
            orderable: false,
            className: "no-sort",
            name: 'is_active',
            width: "10px",
            title: 'Bildirim'
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
