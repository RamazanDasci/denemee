from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

class Role(models.Model):
    OWNER = 'owner'
    PERSONEL = 'personel'
    ATTENDANT = 'attendant'
    
    ROLE_CHOICES = [
        (OWNER, 'Yönetici'),
        (PERSONEL, 'Personel'),
        (ATTENDANT, 'Görevli'),
    ]
    
    name = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        unique=True,
        verbose_name="Rol"
    )
    
    def __str__(self):
        return self.get_name_display()
    
    class Meta:
        verbose_name = "Rol"
        verbose_name_plural = "Roller"

class UserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError('Kullanıcının bir kullanıcı adı olmalıdır')
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_verified', True)
        return self.create_user(username, password, **extra_fields)

class User(AbstractUser):
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='user_groups',
        blank=True,
        verbose_name='Gruplar',
        help_text='Kullanıcının ait olduğu gruplar'
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='user_permissions_set',
        blank=True,
        verbose_name='Kullanıcı izinleri',
        help_text='Kullanıcının özel izinleri'
    )
    
    role = models.ForeignKey(
        Role,
        on_delete=models.SET_DEFAULT,
        default=3,  # Varsayılan olarak Görevli (id=3)
        related_name='users',
        verbose_name="Kullanıcı Rolü"
    )
    email = models.EmailField(blank=True, null=True, verbose_name="E-posta Adresi")
    phone = models.CharField(max_length=15, blank=True, verbose_name="Telefon Numarası")
    address = models.TextField(blank=True, verbose_name="Adres")
    birth_date = models.DateField(null=True, blank=True, verbose_name="Doğum Tarihi")
    profile_picture = models.ImageField(
        upload_to='profile_pics/',
        blank=True, 
        null=True, 
        verbose_name="Profil Resmi",
        help_text="Maksimum boyut 2MB ve boyutlar 200x200 piksel olmalıdır"
    )
    is_verified = models.BooleanField(default=False, verbose_name="Doğrulanmış Kullanıcı")
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    def has_role(self, role_name):
        """Kullanıcının belirli bir role sahip olup olmadığını kontrol eder"""
        return self.role.name == role_name
    
    def get_role_display(self):
        """Kullanıcının rolünün görünen ismini döndürür"""
        return self.role.get_name_display()
    
    def is_owner(self):
        return self.has_role(Role.OWNER)
    
    def is_personel(self):
        return self.has_role(Role.PERSONEL)
    
    def is_attendant(self):
        return self.has_role(Role.ATTENDANT)

    class Meta:
        verbose_name = "Kullanıcı"
        verbose_name_plural = "Kullanıcılar"
        ordering = ['-date_joined']
