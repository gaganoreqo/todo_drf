from rest_framework import serializers

from .models import CompanyDetail, UserDetail


# Handles company fields. This serializer is nested inside UserDetailSerializer
# and is also used by the separate company-details endpoint.
class CompanyDetailSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user_detail.name', read_only=True)
    user_detail = serializers.PrimaryKeyRelatedField(
        queryset=UserDetail.objects.all(),
        required=True,
        error_messages={
            'required': 'User is required.',
            'does_not_exist': 'Selected user does not exist.',
            'incorrect_type': 'User must be selected from the dropdown.',
        },
    )
    company_name = serializers.CharField(
        required=True,
        allow_blank=False,
        max_length=255,
        error_messages={
            'blank': 'Company name is required.',
            'required': 'Company name is required.',
        },
    )
    role = serializers.CharField(
        required=True,
        allow_blank=False,
        max_length=255,
        error_messages={
            'blank': 'Role is required.',
            'required': 'Role is required.',
        },
    )
    location = serializers.CharField(
        required=True,
        allow_blank=False,
        max_length=255,
        error_messages={
            'blank': 'Location is required.',
            'required': 'Location is required.',
        },
    )

    class Meta:
        model = CompanyDetail
        fields = [
            'id',
            'user_detail',
            'user_name',
            'company_name',
            'role',
            'location',
        ]

    def validate_company_name(self, value):
        company_name = value.strip()

        if not company_name:
            raise serializers.ValidationError('Company name is required.')

        return company_name

    def validate_role(self, value):
        role = value.strip()

        if not role:
            raise serializers.ValidationError('Role is required.')

        return role

    def validate_location(self, value):
        location = value.strip()

        if not location:
            raise serializers.ValidationError('Location is required.')

        return location

    def validate_user_detail(self, value):
        if value.is_deleted:
            raise serializers.ValidationError(
                'Company details can only be added for an active user.'
            )

        queryset = CompanyDetail.objects.filter(user_detail=value)

        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                'This user already has company details.'
            )

        return value


# A ModelSerializer converts UserDetail model instances to JSON and validates
# incoming JSON before saving it to the database.
class UserDetailSerializer(serializers.ModelSerializer):
    company_detail = serializers.SerializerMethodField()
    name = serializers.CharField(
        required=True,
        allow_blank=False,
        max_length=255,
        error_messages={
            'blank': 'Name is required.',
            'required': 'Name is required.',
        },
    )
    age = serializers.IntegerField(
        required=True,
        min_value=1,
        error_messages={
            'required': 'Age is required.',
            'min_value': 'Age must be greater than 0.',
            'invalid': 'Age must be a number.',
        },
    )
    gender = serializers.CharField(
        required=True,
        allow_blank=False,
        max_length=50,
        error_messages={
            'blank': 'Gender is required.',
            'required': 'Gender is required.',
        },
    )

    class Meta:
        model = UserDetail
        fields = ['id', 'name', 'age', 'gender', 'is_deleted', 'company_detail']
        read_only_fields = ['is_deleted']

    def validate_name(self, value):
        name = value.strip()

        if not name:
            raise serializers.ValidationError('Name is required.')

        queryset = UserDetail.objects.filter(name__iexact=name)

        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError('This name already exists.')

        return name

    def validate_gender(self, value):
        gender = value.strip()

        if not gender:
            raise serializers.ValidationError('Gender is required.')

        return gender

    def get_company_detail(self, obj):
        company_detail = obj.company_details.first()

        if company_detail is None:
            return None

        return CompanyDetailSerializer(company_detail).data


# Small serializer for the company form user dropdown.
class UserDropdownSerializer(serializers.ModelSerializer):
    has_company = serializers.SerializerMethodField()

    class Meta:
        model = UserDetail
        fields = ['id', 'name', 'has_company']

    def get_has_company(self, obj):
        return obj.company_details.exists()
