# Generated by Django 4.0.7 on 2023-01-30 15:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('unit_selection', '0002_favourite'),
    ]

    operations = [
        migrations.AddField(
            model_name='favourite',
            name='sections_pk',
            field=models.CharField(default=12, max_length=255),
            preserve_default=False,
        ),
    ]