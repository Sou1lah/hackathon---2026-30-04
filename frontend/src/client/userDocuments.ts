import type { CancelablePromise } from './core/CancelablePromise';
import { OpenAPI } from './core/OpenAPI';
import { request as __request } from './core/request';
import type { 
    UserDocumentsReadUserDocumentsData, 
    UserDocumentsPublic, 
    UserDocumentsUploadUserDocumentData, 
    UserDocumentPublic,
    UserDocumentsDeleteUserDocumentData 
} from './userDocumentsTypes';
import type { Message } from './types.gen';

export class UserDocumentsService {
    /**
     * Read User Documents
     * Retrieve user documents.
     * @param data The data for the request.
     * @param data.skip
     * @param data.limit
     * @returns UserDocumentsPublic Successful Response
     * @throws ApiError
     */
    public static readUserDocuments(data: UserDocumentsReadUserDocumentsData = {}): CancelablePromise<UserDocumentsPublic> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/user-documents/',
            query: {
                skip: data.skip,
                limit: data.limit
            },
            errors: {
                422: 'Validation Error'
            }
        });
    }

    /**
     * Upload User Document
     * Upload a user document.
     * @param data The data for the request.
     * @param data.formData
     * @returns UserDocumentPublic Successful Response
     * @throws ApiError
     */
    public static uploadUserDocument(data: UserDocumentsUploadUserDocumentData): CancelablePromise<UserDocumentPublic> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/user-documents/',
            formData: data.formData,
            mediaType: 'multipart/form-data',
            query: {
                type: data.formData.type
            },
            errors: {
                422: 'Validation Error'
            }
        });
    }

    /**
     * Delete User Document
     * Delete a user document.
     * @param data The data for the request.
     * @param data.id
     * @returns Message Successful Response
     * @throws ApiError
     */
    public static deleteUserDocument(data: UserDocumentsDeleteUserDocumentData): CancelablePromise<Message> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/user-documents/{id}',
            path: {
                id: data.id
            },
            errors: {
                422: 'Validation Error'
            }
        });
    }
}
