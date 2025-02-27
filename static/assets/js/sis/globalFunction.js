const AppInitializer = {
    init: function () {
        // Burada çalıştırılacak JavaScript eklentilerini çağırın.
        this.initSelect2();

        //ContactManager başlatılıyor
        // this.initContactManager();
    },

    // initContactManager: function () {
    //     // ContactManager örneği oluştur ve başlat
    //     window.contactManager = new ContactManager();
    //     contactManager.init();
    // },

    initSelect2: function () {
        // Tüm select2 elementlerini etkinleştir
        $('.select2').select2({
            width: '100%',
            placeholder: 'Bir seçim yapın',
        });
    }
};


