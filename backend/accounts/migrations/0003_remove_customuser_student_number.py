# Generated by Django 4.0.7 on 2023-02-03 10:31

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_customuser_student_number'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='customuser',
            name='student_number',
        ),
    ]
