from django.db import models


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
class UserDetail(models.Model):
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
class CompanyDetail(models.Model):
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
