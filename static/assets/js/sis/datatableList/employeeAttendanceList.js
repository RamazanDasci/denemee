import { DataTableManager } from '../datatableManager.js';

const employeeAttendanceTableManager = new DataTableManager({
    tableSelector: '#employeeAttendanceTable',
    key: 'employee-attendance',
    editEndpoint: '/sis/employeeattendance/update/',
    apiEndpoint: '/api/v1/employee-attendance/',
    buttonOptions: { 
        isVisible: true, 
        buttonName: "Devamsızlık Ekle", 
        popupUrl: "/sis/employeeattendance/add/" 
    },
    columns: [
        {
            data: null,
            className: 'text-center',
            orderable: false,
            render: (data, type, row, meta) => {
                const pageInfo = $('#employeeAttendanceTable').DataTable().page.info();
                return pageInfo.start + meta.row + 1;
            },
            width: "10px",
            title: 'No'
        },
        {
            data: 'employee_info',
            render: (data) => `
                <div class="d-flex align-items-center gap-2">
                    <img src="${data.image || '/static/assets/img/default_user.png'}" 
                         alt="${data.first_name}" 
                         class="avatar avatar-sm me-2">
                    <div>
                        <strong>${data.first_name} ${data.last_name}</strong><br>
                        <small class="text-muted">TC: ${data.national_id || '---'}</small>
                    </div>
                </div>`,
            title: 'Çalışan',
        },
        { 
            data: 'attendance_status', 
            className: 'text-center align-middle',
            render: (data) => {
                const statusMap = {
                    late: '<span class="badge bg-warning">Geç</span>',
                    absent: '<span class="badge bg-danger">Yok</span>',
                    present: '<span class="badge bg-success">Var</span>',
                };
                return statusMap[data] || `<span class="badge bg-secondary">${data}</span>`;
            },
            title: 'Durum' 
        },
        { 
            data: 'date', 
            className: 'text-center align-middle',
            render: (data) => `<span class="text-nowrap">${new Date(data).toLocaleDateString()}</span>`,
            title: 'Tarih' 
        },
        {
            data: 'is_daily', 
            className: 'text-center align-middle',
            render: (data) => data 
                ? `<div class="d-flex align-items-center justify-content-center gap-1">
                        <i class="text-success fa-solid fa-circle-check"></i>
                   </div>`
                : `<div class="d-flex align-items-center justify-content-center gap-1">
                        <i class="text-danger fa-solid fa-circle-xmark"></i>
                   </div>`,
            title: 'Günlük?' 
        },
        { 
            data: 'lesson_info', 
            className: 'align-middle',
            render: (data) => data 
                ? `<strong>${data.course_name}</strong> <small>(${data.branch_name})</small>` 
                : '<span class="text-muted">--- Yok ---</span>',
            title: 'Ders Bilgisi' 
        },
        { 
            data: 'comment', 
            className: 'align-middle',
            render: (data) => data ? `<span>${data}</span>` : '<span class="text-muted">Yorum Yok</span>',
            title: 'Yorum' 
        },
        {
            data: null,
            render: (data) => employeeAttendanceTableManager.renderActionColumn(data),
            orderable: false,
            width: "10px",
            title: 'Aksiyonlar'

        },
    ]   
});
