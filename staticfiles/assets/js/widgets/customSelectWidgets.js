$(document).ready(function () {
    // Select2'yi başlat
    $('#special-cases-select').select2({
        placeholder: "Özel Durumları Seçin",
        allowClear: true,
        width: '100%'
    });

    // Seçilen öğeleri gösterme
    $('#special-cases-select').on('change', function () {
        const selectedValues = $(this).val(); // Seçilen değerleri al
        const selectedContainer = $('#selected-special-cases');

        // Önce tüm mevcut öğeleri temizle
        selectedContainer.empty();

        // Yeni öğeleri ekle
        if (selectedValues) {
            selectedValues.forEach(value => {
                const label = $(`#special-cases-select option[value="${value}"]`).text();
                const chip = `
                    <div class="chip d-flex align-items-center" data-value="${value}">
                        <span>${label}</span>
                        <button type="button" class="btn-close ms-2" aria-label="Close" onclick="removeSpecialCase('${value}')"></button>
                    </div>`;
                selectedContainer.append(chip);
            });
        }
    });
});

// Seçilen bir öğeyi kaldırma
function removeSpecialCase(value) {
    const select = $('#special-cases-select');
    const currentValues = select.val();

    // Değeri mevcut seçimlerden kaldır
    const updatedValues = currentValues.filter(item => item !== value);
    select.val(updatedValues).trigger('change'); // Güncelle ve değişiklikleri tetikle
}