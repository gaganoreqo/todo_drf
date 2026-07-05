from django.db import models


# A simple database table for storing user details in the CRUD app.
class UserDetail(models.Model):
    name = models.CharField(max_length=255)
    age = models.PositiveIntegerField()
    gender = models.CharField(max_length=50)
    # Soft delete flag. Deleted records stay in the database but are hidden
    # from the active records list.
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.name


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
