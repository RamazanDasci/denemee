// document.getElementById('campusForm').addEventListener('submit', async function (event) {
//     event.preventDefault();
//     const form = event.target;

//     // Form verilerini JSON formatına dönüştür
//     const formData = new FormData(form);
//     const data = {};
//     formData.forEach((value, key) => {
//         if (data[key]) {
//             if (!Array.isArray(data[key])) {
//                 data[key] = [data[key]];
//             }
//             data[key].push(value);
//         } else {
//             data[key] = value;
//         }
//     });

//     // Fetch isteği
//     const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
//     try {
//         const response = await fetch('/api/v1/campuses/', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'X-CSRFToken': csrfToken,
//             },
//             body: JSON.stringify(data),
//         });

//         if (response.ok) {
//             const result = await response.json();
//             console.log('Başarılı:', result);
//         } else {
//             const error = await response.json();
//             console.error('Hata:', error);
//             handleFormErrors(error.errors);
//         }
//     } catch (error) {
//         console.error('Beklenmeyen hata:', error);
//     }
// });

function handleFormErrors(errors) {
    document.querySelectorAll('.is-invalid').forEach((input) => {
        input.classList.remove('is-invalid');
    });
    document.querySelectorAll('.invalid-feedback').forEach((errorContainer) => {
        errorContainer.remove();
    });

    for (const [field, messages] of Object.entries(errors)) {
        const input = document.querySelector(`[name="${field}"]`);
        if (input) {
            input.classList.add('is-invalid');

            const errorContainer = document.createElement('div');
            errorContainer.classList.add('invalid-feedback');
            errorContainer.textContent = messages.join(', ');
            input.parentNode.appendChild(errorContainer);
        }
    }
}
