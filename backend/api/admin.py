from django.contrib import admin

from .models import UserDetail


# Register the UserDetail model so it can be viewed and managed in Django admin.
admin.site.register(UserDetail)
