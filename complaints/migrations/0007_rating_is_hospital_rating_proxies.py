from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('complaints', '0006_proxy_complaint_models'),
    ]

    operations = [
        migrations.AddField(
            model_name='rating',
            name='is_hospital_rating',
            field=models.BooleanField(default=False),
        ),
        migrations.CreateModel(
            name='DepartmentRating',
            fields=[
            ],
            options={
                'verbose_name': 'Department Rating',
                'verbose_name_plural': 'Department Ratings',
                'proxy': True,
                'indexes': [],
                'constraints': [],
            },
            bases=('complaints.rating',),
        ),
        migrations.CreateModel(
            name='HospitalRating',
            fields=[
            ],
            options={
                'verbose_name': 'Hospital Rating',
                'verbose_name_plural': 'Hospital Ratings',
                'proxy': True,
                'indexes': [],
                'constraints': [],
            },
            bases=('complaints.rating',),
        ),
    ]
