from rest_framework import serializers

from .models import UserDetail


# A ModelSerializer converts UserDetail model instances to JSON and validates
# incoming JSON before saving it to the database.
class UserDetailSerializer(serializers.ModelSerializer):
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
        fields = ['id', 'name', 'age', 'gender', 'is_deleted']
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
