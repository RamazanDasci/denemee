from django.db import models
from user.models import Role
from django.utils.translation import gettext_lazy as _
from django.conf import settings
import os

class Menu(models.Model):
    title = models.CharField(_("Başlık"), max_length=100)
    url_name = models.CharField(_("URL Adı"), max_length=200, blank=True, null=True)
    icon = models.CharField(_("İkon"), max_length=50, blank=True, null=True)
    order = models.IntegerField(_("Sıralama"), default=0)
    is_active = models.BooleanField(_("Aktif"), default=True)
    level = models.IntegerField(_("Seviye"), default=0, editable=False)
    parent = models.ForeignKey(
        'self',
        verbose_name=_("Üst Menü"),
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children'
    )
    roles = models.ManyToManyField(
        Role,
        verbose_name=_("Roller"),
        related_name='menus',
        blank=True
    )

    class Meta:
        verbose_name = _("Menü")
        verbose_name_plural = _("Menüler")
        ordering = ['level', 'order', 'title']

    def __str__(self):
        return " -> ".join(self.get_menu_path())

    def get_menu_path(self):
        """Menünün tam yolunu liste olarak döndürür"""
        path = [self.title]
        current = self
        while current.parent:
            current = current.parent
            path.insert(0, current.title)
        return path

    def get_all_children(self, include_self=True):
        """Tüm alt menüleri recursive olarak getirir"""
        r = []
        if include_self:
            r.append(self)
        for c in self.children.filter(is_active=True):
            _r = c.get_all_children(include_self=True)
            if 0 < len(_r):
                r.extend(_r)
        return r

    def get_children(self):
        """Direkt alt menüleri getirir"""
        return self.children.filter(is_active=True).order_by('order')

    def has_children(self):
        """Alt menü var mı kontrol eder"""
        return self.children.filter(is_active=True).exists()

    def calculate_level(self):
        """Menünün seviyesini hesaplar"""
        level = 0
        current = self
        while current.parent:
            level += 1
            current = current.parent
        return level

    def save(self, *args, **kwargs):
        self.level = self.calculate_level()
        super().save(*args, **kwargs)

   