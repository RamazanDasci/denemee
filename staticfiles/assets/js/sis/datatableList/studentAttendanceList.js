import { DataTableManager } from '../datatableManager.js';

const tableManager = new DataTableManager({
    tableSelector: '#studentAttendanceTable',
    key: 'student',
    apiEndpoint: '/api/v1/student-attendance/',
    editEndpoint: '/sis/studentattendance/update/',
    buttonOptions: { 
        isVisible: true, 
        buttonName: "Devamsızlık Ekle", 
        popupUrl: "/sis/studentattendance/add/" 
    },
    columns: [
        {
            data: null,
            className: 'text-center',
            orderable: false,
            render: (data, type, row, meta) => {
                const pageInfo = $('#studentAttendanceTable').DataTable().page.info();
                return pageInfo.start + meta.row + 1;
            },
            width: "10px",
            title: 'No'
        },
        {
            data: 'student_info',
            render: (data, type, row) => tableManager.renderUserColumn(data, data),
            orderable: true,
            name: 'employee__user__first_name',
            title: 'Öğretmen'
        },
        { 
            data: 'student_info.school_number',
            className: 'text-center align-middle',
            title: 'Okul Numarası' 
        },
        { 
            data: 'student_info.classroom',
            className: 'text-center align-middle',
            render: (data) => data || '<span class="text-muted">---<span>',
            title: 'Sınıf' 
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
            data: null, 
            className: 'align-middle',
            render: (data) => {
                if (data.is_daily) {
                    return '<span class="text-info">Günlük</span>';
                } else if (data.lesson_info) {
                    return `
                        <div>
                            <strong>${data.lesson_info.course_name}</strong><br>
                            <small class="text-muted">${data.lesson_info.branch_name || '---'}</small>
                        </div>
                    `;
                } else {
                    return '<span class="text-muted">---<span>';
                }
            },
            title: 'Devamsızlık' 
        },
        { 
            data: 'is_excused', 
            className: 'text-center align-middle',
            render: (data) => data 
                ? '<i class="text-success bi bi-check-circle"></i>' 
                : '<i class="text-danger bi bi-x-circle"></i>',
            title: 'Mazeretli?' 
        },
        { 
            data: 'comment', 
            className: 'align-middle',
            render: (data) => data ? `<span>${data}</span>` : '<span class="text-muted">Yorum Yok</span>',
            title: 'Yorum' 
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
