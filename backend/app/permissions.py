from rest_framework import permissions
from rest_framework.permissions import BasePermission

class IsGestor(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return (
            user.is_superuser
            or user.groups.filter(name="Gestores").exists()
        )

class IsCriador(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return (
            user.is_authenticated
            and user.groups.filter(name='Criadores').exists()
        )

class IsAdm(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated and user.is_superuser
