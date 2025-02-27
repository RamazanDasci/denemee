// student-detail.js
async function loadStudentDetails(studentId) {
    try {
        const response = await fetch(`/api/student-profiles/${studentId}/`);
        if (!response.ok) throw new Error('Veri yüklenemedi');
        
        const data = await response.json();
        updateStudentUI(data);
    } catch (error) {
        console.error('Hata:', error);
        showErrorMessage('Öğrenci bilgileri yüklenirken bir hata oluştu');
    }
}

function updateStudentUI(data) {
    // Temel bilgiler
    document.getElementById('studentName').textContent = `${data.user.first_name} ${data.user.last_name}`;
    document.getElementById('studentEmail').textContent = data.user.email;
    
    // Akademik bilgiler
    if (data.academic_info) {
        document.getElementById('academicInfo').innerHTML = `
            <p>Sınıf: ${data.academic_info.class_level_display}</p>
            <p>Okul No: ${data.academic_info.school_number}</p>
            <p>Kayıt Türü: ${data.academic_info.registration_type_display}</p>
        `;
    }

    // Veli bilgileri
    const parentsContainer = document.getElementById('parentsInfo');
    parentsContainer.innerHTML = data.parents.map(parent => `
        <div class="parent-card">
            <h3>${parent.user.first_name} ${parent.user.last_name}</h3>
            <p>Meslek: ${parent.occupation || '-'}</p>
            <p>Kurum: ${parent.organization || '-'}</p>
            ${parent.kinships.map(kinship => `
                <div class="kinship-info">
                    <p>İlişki: ${kinship.type_display}</p>
                    <p>Acil Durum: ${kinship.emergency_contact ? 'Evet' : 'Hayır'}</p>
                </div>
            `).join('')}
        </div>
    `).join('');
}