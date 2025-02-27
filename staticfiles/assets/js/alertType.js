// function showAlert(type, message) {
//     const container = document.getElementById('alerts-container');

//     const alert = document.createElement('div');
//     alert.className = `alert alert-${type} alert-dismissible fade show shadow`;
//     alert.innerHTML = `
//         ${message}
//         <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
//     `;

//     container.appendChild(alert);

//     setTimeout(() => {
//         alert.classList.remove('show');
//         setTimeout(() => alert.remove(), 150);
//     }, 3000);
// }

    // Sayfa yüklendiğinde localStorage'daki mesajı kontrol et ve göster
    window.addEventListener('load', () => {
        const message = localStorage.getItem('toastMessage');
        const icon = localStorage.getItem('toastIcon');
    
        if (message && icon) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: icon,
                title: message,
                showConfirmButton: false,
                timer: 3000,
            });
    
            // Mesaj gösterildikten sonra localStorage temizle
            localStorage.removeItem('toastMessage');
            localStorage.removeItem('toastIcon');
        }
    });