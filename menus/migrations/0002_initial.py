# Generated by Django 5.1.3 on 2025-02-13 13:35

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('menus', '0001_initial'),
        ('user', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='menu',
            name='roles',
            field=models.ManyToManyField(blank=True, related_name='menus', to='user.role', verbose_name='Roles'),
        ),
    ]
