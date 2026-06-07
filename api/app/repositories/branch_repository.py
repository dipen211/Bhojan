from app.dummy_db.branches import (
    branches
)


class BranchRepository:

    @staticmethod
    def find_all():

        return branches

    @staticmethod
    def find_by_id(branch_id: int):

        return next(
            (
                branch
                for branch in branches
                if branch["id"] == branch_id
            ),
            None
        )

    @staticmethod
    def find_by_tenant_id(
        tenant_id: int
    ):

        return [
            branch
            for branch in branches
            if branch["tenant_id"] == tenant_id
        ]

    @staticmethod
    def find_by_slug_and_tenant_id(
        slug: str,
        tenant_id: int
    ):
        return next(
            (
                branch
                for branch in branches
                if branch["slug"] == slug and branch["tenant_id"] == tenant_id
            ),
            None
        )

    @staticmethod
    def create(payload):

        new_branch = {
            "id": len(branches) + 1,
            "tenant_id": payload.tenant_id,
            "name": payload.name,
            "slug": payload.slug,
            "address": payload.address,
            "city": payload.city,
            "state": payload.state,
            "pincode": payload.pincode,
            "phone": payload.phone,
            "email": payload.email,
            "manager_name": payload.manager_name,
            "is_active": True,
            "opening_time": payload.opening_time,
            "closing_time": payload.closing_time
        }

        branches.append(new_branch)

        return new_branch

    @staticmethod
    def update(
        branch_id: int,
        payload
    ):

        branch = BranchRepository.find_by_id(
            branch_id
        )

        if not branch:
            return None

        branch["name"] = payload.name
        branch["slug"] = payload.slug
        branch["address"] = payload.address
        branch["city"] = payload.city
        branch["state"] = payload.state
        branch["pincode"] = payload.pincode
        branch["phone"] = payload.phone
        branch["email"] = payload.email
        branch["manager_name"] = payload.manager_name
        branch["opening_time"] = payload.opening_time
        branch["closing_time"] = payload.closing_time

        return branch

    @staticmethod
    def delete(branch_id: int):

        branch = BranchRepository.find_by_id(
            branch_id
        )

        if not branch:
            return False

        branches.remove(branch)

        return True
