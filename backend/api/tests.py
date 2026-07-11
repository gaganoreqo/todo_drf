from unittest.mock import patch

from rest_framework import status
from rest_framework.test import APITestCase

from .jwt import create_access_token
from .models import Account, CompanyDetail, UserDetail
from .serializers import UserDetailSerializer


# APITestCase gives us a test client for calling DRF APIs.
# Each test gets a fresh temporary test database.
class UserDetailApiTests(APITestCase):
    user_url = '/api/v1/user-details/'
    company_url = '/api/v1/company-details/'
    dropdown_url = '/api/v1/user-dropdown/'
    dashboard_url = '/api/v1/dashboard-summary/'
    signup_url = '/api/v1/auth/signup/'
    login_url = '/api/v1/auth/login/'
    accounts_url = '/api/v1/accounts/'

    def setUp(self):
        self.admin_account = self.create_account(
            email='admin@example.com',
            role=Account.ROLE_ADMIN,
        )
        self.authenticate(self.admin_account)

    def create_account(
        self,
        email='user@example.com',
        full_name='Test User',
        password='Password123',
        role=Account.ROLE_USER,
    ):
        account = Account(
            email=email,
            full_name=full_name,
            role=role,
        )
        account.set_password(password)
        account.save()
        return account

    def authenticate(self, account):
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {create_access_token(account)}'
        )

    def create_user(self, name='Rahul', age=25, gender='Male'):
        return UserDetail.objects.create(name=name, age=age, gender=gender)

    def create_company(
        self,
        user,
        company_name='Apple',
        role='Software Engineer',
        location='Cupertino',
    ):
        return CompanyDetail.objects.create(
            user_detail=user,
            company_name=company_name,
            role=role,
            location=location,
        )

    def test_protected_api_requires_jwt(self):
        self.client.credentials()

        response = self.client.get(self.user_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_signup_creates_first_account_as_admin(self):
        Account.objects.all().delete()
        self.client.credentials()

        response = self.client.post(
            self.signup_url,
            {
                'email': 'first@example.com',
                'full_name': 'First Admin',
                'password': 'Password123',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['account']['role'], Account.ROLE_ADMIN)
        self.assertEqual(Account.objects.get().email, 'first@example.com')

    def test_signup_creates_later_accounts_as_user(self):
        self.client.credentials()

        response = self.client.post(
            self.signup_url,
            {
                'email': 'newuser@example.com',
                'full_name': 'New User',
                'password': 'Password123',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['account']['role'], Account.ROLE_USER)

    def test_login_returns_jwt_for_valid_account(self):
        self.client.credentials()

        response = self.client.post(
            self.login_url,
            {
                'email': self.admin_account.email,
                'password': 'Password123',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['account']['email'], self.admin_account.email)

    def test_admin_can_list_accounts(self):
        self.create_account(email='member@example.com')

        response = self.client.get(self.accounts_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_account_admin_requires_admin_role(self):
        member = self.create_account(email='member@example.com')
        self.authenticate(member)

        response = self.client.get(self.accounts_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_cannot_deactivate_self(self):
        response = self.client.delete(
            f'{self.accounts_url}{self.admin_account.id}/'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.admin_account.refresh_from_db()
        self.assertTrue(self.admin_account.is_active)

    def test_create_user(self):
        response = self.client.post(
            self.user_url,
            {
                'name': 'Rahul',
                'age': 25,
                'gender': 'Male',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Rahul')
        self.assertEqual(UserDetail.objects.count(), 1)

    def test_user_required_field_validation(self):
        response = self.client.post(self.user_url, {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('name', response.data)
        self.assertIn('age', response.data)
        self.assertIn('gender', response.data)

    def test_user_name_must_be_unique_case_insensitive(self):
        self.create_user(name='Rahul')

        response = self.client.post(
            self.user_url,
            {
                'name': 'rahul',
                'age': 30,
                'gender': 'Male',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('name', response.data)

    def test_user_managers_return_active_and_deleted_records(self):
        active_user = self.create_user(name='Active User')
        deleted_user = self.create_user(name='Deleted User')
        deleted_user.is_deleted = True
        deleted_user.save(update_fields=['is_deleted'])

        active_names = list(
            UserDetail.active_objects.order_by('name').values_list('name', flat=True)
        )
        deleted_names = list(
            UserDetail.deleted_objects.order_by('name').values_list('name', flat=True)
        )
        all_names = list(
            UserDetail.objects.order_by('name').values_list('name', flat=True)
        )

        self.assertEqual(active_names, [active_user.name])
        self.assertEqual(deleted_names, [deleted_user.name])
        self.assertEqual(all_names, [active_user.name, deleted_user.name])

    def test_update_user_with_put(self):
        user = self.create_user(name='Rahul')

        response = self.client.put(
            f'{self.user_url}{user.id}/',
            {
                'name': 'Rahul Sharma',
                'age': 26,
                'gender': 'Male',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertEqual(user.name, 'Rahul Sharma')
        self.assertEqual(user.age, 26)

    def test_partial_update_user_with_patch(self):
        user = self.create_user(name='Rahul', age=25)

        response = self.client.patch(
            f'{self.user_url}{user.id}/',
            {'age': 28},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertEqual(user.age, 28)
        self.assertEqual(user.name, 'Rahul')

    def test_create_user_with_nested_company_detail(self):
        response = self.client.post(
            self.user_url,
            {
                'name': 'Anita',
                'age': 30,
                'gender': 'Female',
                'company_detail': {
                    'company_name': 'Infosys',
                    'role': 'Engineer',
                    'location': 'Bengaluru',
                },
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(UserDetail.objects.count(), 1)
        self.assertEqual(CompanyDetail.objects.count(), 1)
        company = CompanyDetail.objects.get()
        self.assertEqual(company.user_detail.name, 'Anita')
        self.assertEqual(company.company_name, 'Infosys')
        self.assertEqual(response.data['company_detail']['company_name'], 'Infosys')

    def test_nested_create_rolls_back_user_when_company_create_fails(self):
        serializer = UserDetailSerializer(
            data={
                'name': 'Anita',
                'age': 30,
                'gender': 'Female',
                'company_detail': {
                    'company_name': 'Infosys',
                    'role': 'Engineer',
                    'location': 'Bengaluru',
                },
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)

        with patch(
            'api.serializers.CompanyDetail.objects.create',
            side_effect=RuntimeError('Company create failed.'),
        ):
            with self.assertRaises(RuntimeError):
                serializer.save()

        self.assertEqual(UserDetail.objects.count(), 0)
        self.assertEqual(CompanyDetail.objects.count(), 0)

    def test_partial_update_user_creates_nested_company_detail(self):
        user = self.create_user(name='Anita')

        response = self.client.patch(
            f'{self.user_url}{user.id}/',
            {
                'company_detail': {
                    'company_name': 'Infosys',
                    'role': 'Engineer',
                    'location': 'Bengaluru',
                },
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        company = CompanyDetail.objects.get(user_detail=user)
        self.assertEqual(company.company_name, 'Infosys')
        self.assertEqual(response.data['company_detail']['role'], 'Engineer')

    def test_partial_update_user_updates_nested_company_detail(self):
        user = self.create_user(name='Anita')
        company = self.create_company(
            user,
            company_name='Infosys',
            role='Engineer',
            location='Bengaluru',
        )

        response = self.client.patch(
            f'{self.user_url}{user.id}/',
            {
                'company_detail': {
                    'company_name': 'Infosys',
                    'role': 'Tech Lead',
                    'location': 'Pune',
                },
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        company.refresh_from_db()
        self.assertEqual(company.role, 'Tech Lead')
        self.assertEqual(company.location, 'Pune')
        self.assertEqual(company.user_detail_id, user.id)

    def test_nested_update_rolls_back_user_when_company_create_fails(self):
        user = self.create_user(name='Anita', age=30, gender='Female')
        serializer = UserDetailSerializer(
            user,
            data={
                'name': 'Anita Updated',
                'company_detail': {
                    'company_name': 'Infosys',
                    'role': 'Engineer',
                    'location': 'Bengaluru',
                },
            },
            partial=True,
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)

        with patch(
            'api.serializers.CompanyDetail.objects.create',
            side_effect=RuntimeError('Company create failed.'),
        ):
            with self.assertRaises(RuntimeError):
                serializer.save()

        user.refresh_from_db()
        self.assertEqual(user.name, 'Anita')
        self.assertFalse(user.company_details.exists())

    def test_delete_user_is_soft_delete(self):
        user = self.create_user()

        response = self.client.delete(f'{self.user_url}{user.id}/')

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        user.refresh_from_db()
        self.assertTrue(user.is_deleted)

    def test_deleted_user_is_listed_separately(self):
        active_user = self.create_user(name='Active User')
        deleted_user = self.create_user(name='Deleted User')
        deleted_user.is_deleted = True
        deleted_user.save(update_fields=['is_deleted'])

        active_response = self.client.get(f'{self.user_url}?page=1&page_size=5')
        deleted_response = self.client.get(
            f'{self.user_url}?deleted=true&page=1&page_size=5'
        )

        active_names = [user['name'] for user in active_response.data['results']]
        deleted_names = [user['name'] for user in deleted_response.data['results']]

        self.assertIn(active_user.name, active_names)
        self.assertNotIn(deleted_user.name, active_names)
        self.assertIn(deleted_user.name, deleted_names)

    def test_undelete_user(self):
        user = self.create_user()
        user.is_deleted = True
        user.save(update_fields=['is_deleted'])

        response = self.client.patch(f'{self.user_url}{user.id}/undelete/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertFalse(user.is_deleted)

    def test_user_with_company_cannot_be_deleted(self):
        user = self.create_user()
        self.create_company(user)

        response = self.client.delete(f'{self.user_url}{user.id}/')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        user.refresh_from_db()
        self.assertFalse(user.is_deleted)

    def test_create_company_detail(self):
        user = self.create_user()

        response = self.client.post(
            self.company_url,
            {
                'user_detail': user.id,
                'company_name': 'Apple',
                'role': 'Software Engineer',
                'location': 'Cupertino',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user_name'], user.name)
        self.assertEqual(CompanyDetail.objects.count(), 1)

    def test_user_can_have_only_one_company_detail(self):
        user = self.create_user()
        self.create_company(user)

        response = self.client.post(
            self.company_url,
            {
                'user_detail': user.id,
                'company_name': 'Google',
                'role': 'Developer',
                'location': 'Bengaluru',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('user_detail', response.data)

    def test_company_user_cannot_be_changed_after_create(self):
        original_user = self.create_user(name='Anita')
        new_user = self.create_user(name='Rahul')
        company = self.create_company(original_user)

        response = self.client.patch(
            f'{self.company_url}{company.id}/',
            {'user_detail': new_user.id},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('user_detail', response.data)
        company.refresh_from_db()
        self.assertEqual(company.user_detail_id, original_user.id)

    def test_company_partial_update_keeps_original_user(self):
        user = self.create_user(name='Anita')
        company = self.create_company(user, role='Engineer')

        response = self.client.patch(
            f'{self.company_url}{company.id}/',
            {'role': 'Lead Engineer'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        company.refresh_from_db()
        self.assertEqual(company.role, 'Lead Engineer')
        self.assertEqual(company.user_detail_id, user.id)

    def test_company_full_update_keeps_original_user(self):
        user = self.create_user(name='Anita')
        company = self.create_company(user)

        response = self.client.put(
            f'{self.company_url}{company.id}/',
            {
                'user_detail': user.id,
                'company_name': 'Infosys',
                'role': 'Tech Lead',
                'location': 'Bengaluru',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        company.refresh_from_db()
        self.assertEqual(company.company_name, 'Infosys')
        self.assertEqual(company.role, 'Tech Lead')
        self.assertEqual(company.location, 'Bengaluru')
        self.assertEqual(company.user_detail_id, user.id)

    def test_company_list_includes_joined_user_name(self):
        user = self.create_user(name='Anita')
        self.create_company(user, company_name='Infosys')

        response = self.client.get(f'{self.company_url}?page=1&page_size=5')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['results'][0]['user_name'], 'Anita')
        self.assertEqual(response.data['results'][0]['company_name'], 'Infosys')

    def test_user_dropdown_returns_active_users_with_company_status(self):
        user_with_company = self.create_user(name='Anita')
        user_without_company = self.create_user(name='Rahul')
        deleted_user = self.create_user(name='Deleted')
        deleted_user.is_deleted = True
        deleted_user.save(update_fields=['is_deleted'])
        self.create_company(user_with_company)

        response = self.client.get(self.dropdown_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [user['name'] for user in response.data]
        self.assertIn(user_with_company.name, names)
        self.assertIn(user_without_company.name, names)
        self.assertNotIn(deleted_user.name, names)

        company_status = {
            user['name']: user['has_company'] for user in response.data
        }
        self.assertTrue(company_status[user_with_company.name])
        self.assertFalse(company_status[user_without_company.name])

    def test_dashboard_summary_returns_counts(self):
        user_with_company = self.create_user(name='Anita')
        self.create_user(name='Rahul')
        deleted_user = self.create_user(name='Deleted')
        deleted_user.is_deleted = True
        deleted_user.save(update_fields=['is_deleted'])
        self.create_company(user_with_company)

        response = self.client.get(self.dashboard_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['active_users'], 2)
        self.assertEqual(response.data['company_records'], 1)
        self.assertEqual(response.data['deleted_users'], 1)
        self.assertEqual(response.data['available_users'], 1)

    def test_user_pagination(self):
        for index in range(7):
            self.create_user(name=f'User {index}', age=20 + index)

        response = self.client.get(f'{self.user_url}?page=2&page_size=5')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 7)
        self.assertEqual(len(response.data['results']), 2)

    def test_user_search_filter_and_ordering(self):
        anita = self.create_user(name='Anita', age=30, gender='Female')
        self.create_user(name='Rahul', age=25, gender='Male')
        self.create_company(anita, company_name='Apple')

        search_response = self.client.get(
            f'{self.user_url}?page=1&page_size=5&search=Apple'
        )
        filter_response = self.client.get(
            f'{self.user_url}?page=1&page_size=5&gender=Female'
        )
        ordering_response = self.client.get(
            f'{self.user_url}?page=1&page_size=5&ordering=-age'
        )

        self.assertEqual(search_response.data['count'], 1)
        self.assertEqual(search_response.data['results'][0]['name'], 'Anita')
        self.assertEqual(filter_response.data['count'], 1)
        self.assertEqual(filter_response.data['results'][0]['gender'], 'Female')
        self.assertEqual(ordering_response.data['results'][0]['name'], 'Anita')

    def test_company_search_filter_and_ordering(self):
        anita = self.create_user(name='Anita')
        rahul = self.create_user(name='Rahul')
        self.create_company(
            anita,
            company_name='Apple',
            role='Engineer',
            location='Cupertino',
        )
        self.create_company(
            rahul,
            company_name='Google',
            role='Manager',
            location='Bengaluru',
        )

        search_response = self.client.get(
            f'{self.company_url}?page=1&page_size=5&search=Google'
        )
        filter_response = self.client.get(
            f'{self.company_url}?page=1&page_size=5&location=Cupertino'
        )
        ordering_response = self.client.get(
            f'{self.company_url}?page=1&page_size=5&ordering=-company_name'
        )

        self.assertEqual(search_response.data['count'], 1)
        self.assertEqual(search_response.data['results'][0]['company_name'], 'Google')
        self.assertEqual(filter_response.data['count'], 1)
        self.assertEqual(filter_response.data['results'][0]['location'], 'Cupertino')
        self.assertEqual(
            ordering_response.data['results'][0]['company_name'],
            'Google',
        )
