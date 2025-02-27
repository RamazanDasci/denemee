import { DataTableManager } from '../datatableManager.js';

const tableManager = new DataTableManager({
    tableSelector: '#assignmentTable',
    editEndpoint: '/sis/employee-assignment/update/',
    apiEndpoint: '/api/v1/employee-assignments/',
    buttonOptions: { 
        isVisible: true, 
        buttonName: "Görevlendirme Ekle", 
        popupUrl: "/sis/employee-assignment/add/" 
    },
    key: 'employeeAssignment',
    columns: [
        {
            data: null,
            className: 'text-center',
            orderable: false,
            render: (data, type, row, meta) => {
                const pageInfo = $('#assignmentTable').DataTable().page.info();
                return pageInfo.start + meta.row + 1;
            },
            width: "10px",
            title: 'No'
        },
        {
            data: null,
            render: function (data, type, row) {
                // Kontrol: data.assignments listesinde "Öğretmen" olan bir görev var mı?
                const isTeacher = data.job === 'Öğretmen';
        
                // Detay sayfası URL'sini belirle
                const detailPageUrl = isTeacher 
                    ? `/sis/teacher/${data.user.id}/detail` 
                    : `/sis/employee/${data.user.id}/detail`;
        
                // Kullanıcı sütununu oluştur
                return `
                    <div class="d-flex align-items-center">
                        <div class="avatar avatar-sm me-2">
                            <img src="${data.user.image || '/static/assets/img/default_user.png'}" 
                                 class="avatar-img"
                                 alt="${data.user.first_name}"
                                 onerror="this.src='/static/assets/img/default_user.png'">
                        </div>
                        <div class="d-flex flex-column">
                            <a href="${detailPageUrl}" class="text-primary fw-medium mb-1">
                                ${data.user.first_name} ${data.user.last_name}
                            </a>
                        </div>
                    </div>`;
            },
            orderable: true,
            name: 'user__first_name',
            title: 'Çalışan'
        },
        {
            data: 'school',
            title: 'Okul',
            render: (data) => data || '-',
            name: 'school',
            className: 'text-center'
        },
        {
            data: 'campus',
            title: 'Kampüs',
            render: (data) => data || '-',
            name: 'campus',
            className: 'text-center'
        },
        {
            data: 'job',
            title: 'Görevi',
            render: (data) => `<span class="badge badge-soft-primary">${data}</span>`,
            name: 'job',
            className: 'text-center'
        },
        {
            data: 'start_date',
            title: 'Başlangıç Tarihi',
            render: (data) => data ? moment(data).format('DD.MM.YYYY') : '-',
            name: 'start_date',
            className: 'text-center'
        },
        {
            data: 'end_date',
            title: 'Bitiş Tarihi',
            render: (data) => data ? moment(data).format('DD.MM.YYYY') : '<span class="text-muted">Devam Ediyor</span>',
            name: 'end_date',
            className: 'text-center'
        },
        {
            data: 'description',
            title: 'Açıklama',
            render: (data) => data || '-',
            name: 'description',
            className: 'text-center'
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
