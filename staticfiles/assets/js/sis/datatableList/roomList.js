import { DataTableManager } from '../datatableManager.js';

const tableManager = new DataTableManager({
    tableSelector: '#roomTable',
    key: 'room',
    editEndpoint: '/sis/room/update/',
    apiEndpoint: '/api/v1/rooms/',
    buttonOptions: { 
        isVisible: true, 
        buttonName: "Oda Ekle", 
        popupUrl: "/sis/room/add/" 
    },
    columns: [
        {
            data: null,
            className: 'text-center',
            orderable: false,
            render: (data, type, row, meta) => {
                const pageInfo = $('#roomTable').DataTable().page.info();
                return pageInfo.start + meta.row + 1;
            },
            width: "10px",
            title: 'No'
            
        },
        {
            data: 'name',
            orderable: true,
            name: 'name',
            title: 'Oda Adı'
        },
        {
            data: 'room_code',
            orderable: true,
            name: 'room_code',
            title: 'Oda Kodu'
        },
        {
            data: 'building.name',
            orderable: true,
            name: 'building.name',
            title: 'Bina Adı'
        },
        {
            data: 'floor_number',
            render: (data) => data ? `${data}. Kat` : '-',
            orderable: true,
            name: 'floor_number',
            title: 'Kat Numarası'
        },
        {
            data: 'room_type_display',
            orderable: true,
            name: 'room_type_display',
            title: 'Oda Türü'
        },
        {
            data: 'capacity',
            render: (data) => data ? `${data} Kişi` : '-',
            orderable: true,
            name: 'capacity',
            title: 'Kapasite'
        },
        {
            data: 'size_in_sqm',
            render: (data) => data ? `${data} m²` : '-',
            orderable: true,
            name: 'size_in_sqm',
            title: 'Metrekare'
        },
        {
            data: 'seating_arrangement',
            orderable: true,
            name: 'seating_arrangement',
            title: 'Oturum Düzeni'
        },
        {
            data: 'has_projector',
            render: (data) => data ? 'Evet' : 'Hayır',
            orderable: true,
            name: 'has_projector',
            title: 'Projektör Var mı?'
        },
        {
            data: 'has_ac',
            render: (data) => data ? 'Evet' : 'Hayır',
            orderable: true,
            name: 'has_ac',
            title: 'Klima Var mı?'
        },
        {
            data: 'is_available',
            render: (data) => data ? 'Uygun' : 'Meşgul',
            orderable: true,
            name: 'is_available',
            title: 'Durum'
        },
        {
            data: 'amenities',
            render: (data) => data ? data.join(', ') : '-',
            orderable: false,
            name: 'amenities',
            title: 'İmkanlar'
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
