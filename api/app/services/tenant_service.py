from app.dummy_db.tenants import tenants


class TenantService:

    @staticmethod
    def get_tenant_by_slug(slug: str):

        return next(
            (
                tenant
                for tenant in tenants
                if tenant["slug"] == slug
            ),
            None
        )