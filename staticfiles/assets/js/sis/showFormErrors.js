// document.addEventListener("DOMContentLoaded", () => {
//     const messagesContainer = document.getElementById("messages-container");
//     const messagesList = document.getElementById("messages-list");

//     if (messagesList) {
//         // Mesajları oku ve işlem yap
//         const messages = messagesList.querySelectorAll("li.message");
//         messages.forEach((message) => {
//             const messageType = message.classList.contains("success") ? "success" : "error";
//             const messageText = message.textContent;

//             if (messageType === "success") {
//                 console.log("Success:", messageText);
//                 showAlert("success", messageText);
//             } else if (messageType === "error") {
//                 console.log("Error:", messageText);
//                 showAlert("danger", messageText);
//             }
//         });

//         // Mesajları işledikten sonra container'ı temizle
//         messagesContainer.innerHTML = "";
//     }

//     // Bildirim göstermek için bir yardımcı fonksiyon
//     function showAlert(type, message) {
//         const alertsContainer = document.getElementById("alerts-container") || createAlertsContainer();
//         const alert = document.createElement("div");
//         alert.className = `alert alert-${type} fade show`;
//         alert.textContent = message;
//         alertsContainer.appendChild(alert);

//         setTimeout(() => {
//             alert.classList.remove("show");
//             alert.addEventListener("transitionend", () => alert.remove());
//         }, 5000); // 5 saniye sonra kaybolur
//     }

//     // Eğer bir alert container yoksa oluştur
//     function createAlertsContainer() {
//         const container = document.createElement("div");
//         container.id = "alerts-container";
//         container.style.position = "fixed";
//         container.style.top = "20px";
//         container.style.right = "20px";
//         container.style.zIndex = "1050";
//         document.body.appendChild(container);
//         return container;
//     }
// });