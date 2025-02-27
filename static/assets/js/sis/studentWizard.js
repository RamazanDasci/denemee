// class StudentWizardManager {
//     constructor() {
//         this.modal = new bootstrap.Modal(document.getElementById('dynamicModal'));
//         this.modalBody = document.getElementById('modalContent');
//         this.initializeModalEvents();
//     }

//     openModal() {
//         if (!this.modalBody) {
//             console.error("Modal body bulunamadı.");
//             return;
//         }

//         this.modalBody.innerHTML = '<p class="text-center my-3">Yükleniyor...</p>';
//         this.modal.show();
//         this.loadModalContent();
//     }

//     async loadModalContent() {
//         try {
//             const response = await fetch("/sis/student/create/popup/");
//             const html = await response.text();
            
//             this.modalBody.innerHTML = html;
//             this.initializeModalComponents(html);
//         } catch (error) {
//             this.handleError(error);
//         }
//     }

//     initializeModalComponents(html) {
//         const parser = new DOMParser();
//         const doc = parser.parseFromString(html, 'text/html');
//         const wizardOverlay = doc.querySelector('.card');

//         this.initializeWizard(wizardOverlay);
//         this.initializeSelect2();
//         this.initializeImageUpload();
//         this.initializeParentWidgets();
//     }

//     initializeWizard(wizardOverlay) {
//         if (wizardOverlay && typeof initializeWizard === 'function') {
//             initializeWizard(wizardOverlay);
//         }
//     }

//     initializeSelect2() {
//         $(this.modalBody).find('.select2').select2({
//             dropdownParent: $('#dynamicModal'),
//             width: '100%'
//         });
//     }

//     initializeImageUpload() {
//         if (typeof initializeCustomImageUpload === 'function') {
//             const imageUploadContainer = this.modalBody.querySelector('#imageCropperModal')?.closest('.form-group');
//             if (imageUploadContainer) {
//                 initializeCustomImageUpload(imageUploadContainer);
//             }
//         }
//     }

//     initializeParentWidgets() {
//         if (typeof initializeParentWidgets === 'function') {
//             initializeParentWidgets();
//         }
//     }

//     handleError(error) {
//         this.modalBody.innerHTML = '<p class="text-danger text-center">Bir hata oluştu. Lütfen tekrar deneyin.</p>';
//         console.error(error);
//     }

//     initializeModalEvents() {
//         document.getElementById('dynamicModal').addEventListener('hidden.bs.modal', () => {
//             if (this.modalBody) {
//                 this.modalBody.innerHTML = '<p>Yükleniyor...</p>';
//             }
            
//             if (typeof removeImage === 'function') {
//                 removeImage();
//             }
//         });
//     }
// }

// // HTML'deki openStudentWizardModal fonksiyonu yerine bu global fonksiyonu kullanın
// window.openStudentWizardModal = function() {
//     studentWizardManager.openModal();
// };

// // Sayfa yüklendiğinde başlat
// let studentWizardManager;

// document.addEventListener('DOMContentLoaded', () => {
//     studentWizardManager = new StudentWizardManager();
// });
