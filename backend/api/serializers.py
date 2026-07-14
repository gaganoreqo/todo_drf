from django.db import transaction
from drf_spectacular.utils import OpenApiTypes, extend_schema_field
from rest_framework import serializers

from .models import Account, CompanyDetail, UserDetail


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = [
            'id',
            'email',
            'full_name',
            'role',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'email', 'created_at', 'updated_at']

    def validate_full_name(self, value):
        full_name = value.strip()

        if not full_name:
            raise serializers.ValidationError('Full name is required.')

        return full_name


class SignupSerializer(serializers.Serializer):
    email = serializers.EmailField()
    full_name = serializers.CharField(max_length=255)
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_email(self, value):
        email = value.strip().lower()

        if Account.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError('This email is already registered.')

        return email

    def validate_full_name(self, value):
        full_name = value.strip()

        if not full_name:
            raise serializers.ValidationError('Full name is required.')

        return full_name

    def create(self, validated_data):
        is_first_account = not Account.objects.exists()
        account = Account(
            email=validated_data['email'],
            full_name=validated_data['full_name'],
            role=Account.ROLE_ADMIN if is_first_account else Account.ROLE_USER,
        )
        account.set_password(validated_data['password'])
        account.save()
        return account


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs['email'].strip().lower()
        password = attrs['password']

        try:
            account = Account.objects.get(email__iexact=email)
        except Account.DoesNotExist as exc:
            raise serializers.ValidationError('Invalid email or password.') from exc

        if not account.is_active:
            raise serializers.ValidationError('This account is inactive.')

        if not account.check_password(password):
            raise serializers.ValidationError('Invalid email or password.')

        attrs['account'] = account
        return attrs


# Handles company fields for the separate company-details endpoint.
class CompanyDetailSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user_detail.name', read_only=True)
    user_detail = serializers.PrimaryKeyRelatedField(
        queryset=UserDetail.active_objects.all(),
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
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user_name', 'created_at', 'updated_at']

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

    def validate(self, attrs):
        if (
            self.instance
            and 'user_detail' in attrs
            and attrs['user_detail'].id != self.instance.user_detail_id
        ):
            raise serializers.ValidationError({
                'user_detail': (
                    'Company details cannot be moved to another user. '
                    'Delete and recreate the company details instead.'
                )
            })

        return attrs

    def create(self, validated_data):
        return CompanyDetail.objects.create(**validated_data)

    def update(self, instance, validated_data):
        validated_data.pop('user_detail', None)
        updated_fields = []

        for field in ['company_name', 'role', 'location']:
            if field in validated_data:
                setattr(instance, field, validated_data[field])
                updated_fields.append(field)

        if updated_fields:
            updated_fields.append('updated_at')
            instance.save(update_fields=updated_fields)

        return instance


class CompanyDetailNestedSerializer(serializers.ModelSerializer):
    user_detail = serializers.IntegerField(source='user_detail_id', read_only=True)
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
            'company_name',
            'role',
            'location',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user_detail', 'created_at', 'updated_at']

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


# A ModelSerializer converts UserDetail model instances to JSON and validates
# incoming JSON before saving it to the database.
class UserDetailSerializer(serializers.ModelSerializer):
    company_detail = CompanyDetailNestedSerializer(required=False, allow_null=True)
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
        fields = [
            'id',
            'name',
            'age',
            'gender',
            'is_deleted',
            'company_detail',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'is_deleted', 'created_at', 'updated_at']

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

    def create(self, validated_data):
        company_data = validated_data.pop('company_detail', None)

        with transaction.atomic():
            user_detail = UserDetail.objects.create(**validated_data)

            if company_data:
                CompanyDetail.objects.create(user_detail=user_detail, **company_data)

        return user_detail

    def update(self, instance, validated_data):
        company_data = validated_data.pop('company_detail', None)
        updated_fields = []

        with transaction.atomic():
            for field in ['name', 'age', 'gender']:
                if field in validated_data:
                    setattr(instance, field, validated_data[field])
                    updated_fields.append(field)

            if updated_fields:
                updated_fields.append('updated_at')
                instance.save(update_fields=updated_fields)

            if company_data:
                company_detail = instance.company_detail

                if company_detail is None:
                    CompanyDetail.objects.create(
                        user_detail=instance,
                        **company_data,
                    )
                else:
                    company_updated_fields = []

                    for field in ['company_name', 'role', 'location']:
                        if field in company_data:
                            setattr(company_detail, field, company_data[field])
                            company_updated_fields.append(field)

                    if company_updated_fields:
                        company_updated_fields.append('updated_at')
                        company_detail.save(update_fields=company_updated_fields)

        return instance


# Small serializer for the company form user dropdown.
class UserDropdownSerializer(serializers.ModelSerializer):
    has_company = serializers.SerializerMethodField()

    class Meta:
        model = UserDetail
        fields = ['id', 'name', 'has_company']

    @extend_schema_field(OpenApiTypes.BOOL)
    def get_has_company(self, obj):
        return obj.company_details.exists()
