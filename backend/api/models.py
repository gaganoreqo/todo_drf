from django.contrib.auth.hashers import check_password, make_password
from django.db import models


class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Account(TimestampedModel):
    ROLE_ADMIN = 'admin'
    ROLE_USER = 'user'
    ROLE_CHOICES = [
        (ROLE_ADMIN, 'Admin'),
        (ROLE_USER, 'User'),
    ]

    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    password_hash = models.CharField(max_length=255)
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default=ROLE_USER,
    )
    is_active = models.BooleanField(default=True)
    class Meta:
        ordering = ['-created_at']

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    @property
    def is_admin(self):
        return self.role == self.ROLE_ADMIN

    def set_password(self, raw_password):
        self.password_hash = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password_hash)

    def __str__(self):
        return self.email


class UserDetailQuerySet(models.QuerySet):
    def active(self):
        return self.filter(is_deleted=False)

    def deleted(self):
        return self.filter(is_deleted=True)


class ActiveUserDetailManager(models.Manager):
    def get_queryset(self):
        return UserDetailQuerySet(self.model, using=self._db).active()


class DeletedUserDetailManager(models.Manager):
    def get_queryset(self):
        return UserDetailQuerySet(self.model, using=self._db).deleted()


# A simple database table for storing user details in the CRUD app.
class UserDetail(TimestampedModel):
    name = models.CharField(max_length=255)
    age = models.PositiveIntegerField()
    gender = models.CharField(max_length=50)
    # Soft delete flag. Deleted records stay in the database but are hidden
    # from the active records list.
    is_deleted = models.BooleanField(default=False)

    objects = UserDetailQuerySet.as_manager()
    active_objects = ActiveUserDetailManager()
    deleted_objects = DeletedUserDetailManager()

    def __str__(self):
        return self.name

    @property
    def company_detail(self):
        return self.company_details.first()


# Company information connected to a user detail record by foreign key.
class CompanyDetail(TimestampedModel):
    user_detail = models.ForeignKey(
        UserDetail,
        on_delete=models.CASCADE,
        related_name='company_details',
    )
    company_name = models.CharField(max_length=255)
    role = models.CharField(max_length=255)
    location = models.CharField(max_length=255)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user_detail'],
                name='unique_company_detail_per_user',
            )
        ]

    def __str__(self):
        return self.company_name
