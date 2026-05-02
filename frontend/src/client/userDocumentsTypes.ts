export enum DocumentType {
    CV = "cv",
    CERTIFICATE = "certificate",
    PHD_DOC = "phd_doc",
    OTHER = "other"
}

export type UserDocumentPublic = {
    name: string;
    type: DocumentType;
    url: string;
    id: string;
    owner_id: string;
    created_at: string;
};

export type UserDocumentsPublic = {
    data: Array<UserDocumentPublic>;
    count: number;
};

export type UserDocumentsReadUserDocumentsData = {
    limit?: number;
    skip?: number;
};

export type UserDocumentsUploadUserDocumentData = {
    formData: {
        file: Blob | File;
        type?: DocumentType;
    };
};

export type UserDocumentsDeleteUserDocumentData = {
    id: string;
};
