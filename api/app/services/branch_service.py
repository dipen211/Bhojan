from app.repositories.branch_repository import (
    BranchRepository
)


class BranchService:

    @staticmethod
    def get_all_branches():
        return BranchRepository.find_all()

    @staticmethod
    def get_branch_by_id(
        branch_id: int
    ):
        return BranchRepository.find_by_id(
            branch_id
        )

    @staticmethod
    def get_tenant_branches(
        tenant_id: int
    ):
        return BranchRepository.find_by_tenant_id(
            tenant_id
        )

    @staticmethod
    def create_branch(payload):
        return BranchRepository.create(
            payload
        )

    @staticmethod
    def update_branch(
        branch_id: int,
        payload
    ):
        return BranchRepository.update(
            branch_id,
            payload
        )

    @staticmethod
    def delete_branch(
        branch_id: int
    ):
        return BranchRepository.delete(
            branch_id
        )