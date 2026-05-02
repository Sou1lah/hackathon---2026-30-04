import uuid
from typing import Any

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, SessionDep
from app.crud_mobility import (
    create_mobility_file,
    delete_mobility_file,
    get_mobility_file,
    get_mobility_files,
    get_mobility_files_all,
    update_mobility_file,
    get_internship_summary_data,
    create_internship_report,
    get_internship_reports,
    update_internship_report,
    create_tutor_evaluation,
    get_tutor_evaluation,
)
from app.models import Message
from app.models_mobility import (
    MobilityFileCreate,
    MobilityFilePublic,
    MobilityFilesPublic,
    MobilityFileUpdate,
    MobilityType,
    InternshipReportCreate,
    InternshipReportPublic,
    InternshipReportsPublic,
    InternshipReportUpdate,
    TutorEvaluationCreate,
    TutorEvaluationPublic,
)

router = APIRouter(prefix="/mobility", tags=["mobility"])


@router.get("/", response_model=MobilityFilesPublic)
def read_mobility_files(
    session: SessionDep,
    current_user: CurrentUser,
    mobility_type: MobilityType | None = None,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve mobility files, optionally filtered by type (nationale/internationale).
    Admins/superusers see ALL files; regular users see only their own.
    """
    if current_user.is_superuser or current_user.can_review_applications:
        items, count = get_mobility_files_all(
            session=session,
            mobility_type=mobility_type,
            skip=skip,
            limit=limit,
        )
    else:
        items, count = get_mobility_files(
            session=session,
            owner_id=current_user.id,
            mobility_type=mobility_type,
            skip=skip,
            limit=limit,
        )
    return MobilityFilesPublic(
        data=[MobilityFilePublic.model_validate(i) for i in items], count=count
    )


@router.get("/{id}", response_model=MobilityFilePublic)
def read_mobility_file(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Any:
    """
    Get mobility file by ID.
    """
    file = get_mobility_file(session=session, file_id=id)
    if not file:
        raise HTTPException(status_code=404, detail="Mobility file not found")
    if file.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return file


@router.post("/", response_model=MobilityFilePublic)
def create_mobility(
    *, session: SessionDep, current_user: CurrentUser, file_in: MobilityFileCreate
) -> Any:
    """
    Create new mobility file.
    """
    return create_mobility_file(
        session=session, file_in=file_in, owner_id=current_user.id
    )


@router.put("/{id}", response_model=MobilityFilePublic)
def update_mobility(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    file_in: MobilityFileUpdate,
) -> Any:
    """
    Update a mobility file.
    """
    db_file = get_mobility_file(session=session, file_id=id)
    if not db_file:
        raise HTTPException(status_code=404, detail="Mobility file not found")
    if db_file.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return update_mobility_file(session=session, db_file=db_file, file_in=file_in)


@router.delete("/{id}")
def delete_mobility(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete a mobility file.
    """
    db_file = get_mobility_file(session=session, file_id=id)
    if not db_file:
        raise HTTPException(status_code=404, detail="Mobility file not found")
    if db_file.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    delete_mobility_file(session=session, db_file=db_file)
    return Message(message="Mobility file deleted successfully")


@router.get("/internship-summary/{id}", response_model=dict[str, Any])
def read_internship_summary(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Any:
    """
    Get summary data for the internship dashboard.
    """
    return get_internship_summary_data(session=session, internship_request_id=id)


# ---------- Reports ----------

@router.get("/reports/{internship_id}", response_model=InternshipReportsPublic)
def read_reports(
    session: SessionDep,
    current_user: CurrentUser,
    internship_id: uuid.UUID,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    items, count = get_internship_reports(
        session=session, internship_request_id=internship_id, skip=skip, limit=limit
    )
    return InternshipReportsPublic(
        data=[InternshipReportPublic.model_validate(i) for i in items], count=count
    )


@router.post("/reports/", response_model=InternshipReportPublic)
def create_report(
    *, session: SessionDep, current_user: CurrentUser, report_in: InternshipReportCreate
) -> Any:
    return create_internship_report(
        session=session, report_in=report_in, owner_id=current_user.id
    )


# ---------- Evaluations ----------

@router.get("/evaluations/{internship_id}", response_model=TutorEvaluationPublic | None)
def read_evaluation(
    session: SessionDep, current_user: CurrentUser, internship_id: uuid.UUID
) -> Any:
    return get_tutor_evaluation(session=session, internship_request_id=internship_id)


@router.post("/evaluations/", response_model=TutorEvaluationPublic)
def create_evaluation(
    *, session: SessionDep, current_user: CurrentUser, evaluation_in: TutorEvaluationCreate
) -> Any:
    # DB-driven permission check: can_review_applications covers tutors and admins
    if not current_user.is_superuser and not current_user.can_review_applications:
        raise HTTPException(status_code=403, detail="Access denied: 'can_review_applications' required")
    
    return create_tutor_evaluation(
        session=session, evaluation_in=evaluation_in, owner_id=current_user.id
    )
