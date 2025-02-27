import { DataTableManager } from '../datatableManager.js';

const leaveTableManager = new DataTableManager({
    tableSelector: '#leaveTable',
    key: 'leaves',
    editEndpoint: '/sis/employeeleave/update/',
    buttonOptions: { 
        isVisible: true, 
        buttonName: "Çalışan İzni Ekle", 
        popupUrl: "/sis/employeeleave/add/" 
    },
    apiEndpoint: '/api/v1/employee-leaves/',
    columns: [

        {
            data: null,
            className: 'text-center',
            orderable: false,
            render: (data, type, row, meta) => {
                const pageInfo = $('#leaveTable').DataTable().page.info();
                return pageInfo.start + meta.row + 1;
            },
            width: "10px",
            title: 'No',
        },
        {
            data: null,
            render: function (data, type, row) {
                return `
                    <div class="d-flex align-items-center">
                        <div class="avatar avatar-sm me-2">
                            <img src="${data.user.image || '/static/assets/img/default_user.png'}" 
                                 class="avatar-img"
                                 alt="${data.user.first_name}"
                                 onerror="this.src='/static/assets/img/default_user.png'">
                        </div>
                        <div class="d-flex flex-column">
                            <span class="fw-medium">${data.user.first_name} ${data.user.last_name}</span>
                            <small class="text-muted">${data.user.username}</small>
                        </div>
                    </div>`;
            },
            orderable: true,
            name: 'user',
            title: 'Çalışan',
            className: 'text-start',
        },
        {
            data: 'leave_type',
            orderable: true,
            name: 'leave_type',
            title: 'İzin Türü',
            className: 'text-start font-bold',
        },
        {
            data: 'start_date',
            orderable: true,
            name: 'start_date',
            title: 'Başlangıç Tarihi',
            render: (data) => `<span class="badge badge-soft-success">${data}</span>`,
            className: 'text-start',
        },
        {
            data: 'end_date',
            orderable: true,
            name: 'end_date',
            title: 'Bitiş Tarihi',
            render: (data) => data ? `<span class="badge badge-soft-danger">${data}</span>` : 'Devam Ediyor',
            className: 'text-start',
        },
        {
            data: 'status',
            orderable: true,
            name: 'status',
            title: 'Durum',
            render: (data) => `<span class="badge badge-soft-primary">${data}</span>`,
            className: 'text-start',
        },
        {
            data: null,
            render: (data) => leaveTableManager.renderActionColumn(data),
            orderable: false,
            width: "10px",
            title: 'Aksiyonlar',
        },
    ],
});
