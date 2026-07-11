from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_alter_companydetail_user_detail_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Account',
            fields=[
                (
                    'id',
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name='ID',
                    ),
                ),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('full_name', models.CharField(max_length=255)),
                ('password_hash', models.CharField(max_length=255)),
                (
                    'role',
                    models.CharField(
                        choices=[('admin', 'Admin'), ('user', 'User')],
                        default='user',
                        max_length=20,
                    ),
                ),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
