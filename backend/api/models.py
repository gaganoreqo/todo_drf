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
