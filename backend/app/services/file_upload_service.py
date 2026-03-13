"""
File upload service for MinIO/S3 storage
"""

import boto3
import uuid
from datetime import timedelta
from typing import Optional
from app.config import settings


class FileUploadService:
    """Service for handling file uploads to MinIO/S3"""
    
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            endpoint_url=settings.S3_ENDPOINT_URL,
            aws_access_key_id=settings.S3_ACCESS_KEY_ID,
            aws_secret_access_key=settings.S3_SECRET_ACCESS_KEY,
            region_name=settings.S3_REGION
        )
        self.bucket_name = settings.S3_BUCKET_NAME
    
    def generate_upload_url(
        self, 
        expert_id: uuid.UUID, 
        filename: str, 
        content_type: str = "application/pdf",
        expiry_seconds: int = 300
    ) -> dict:
        """
        Generate a presigned URL for direct file upload to MinIO
        
        Args:
            expert_id: The expert's UUID
            filename: Original filename
            content_type: MIME type of the file
            expiry_seconds: URL expiration time (default 5 minutes)
        
        Returns:
            dict with upload_url, s3_key, and file_id
        """
        # Generate unique file ID and S3 key
        file_id = str(uuid.uuid4())
        file_extension = filename.split('.')[-1] if '.' in filename else 'pdf'
        s3_key = f"experts/{expert_id}/files/{file_id}.{file_extension}"
        
        # Generate presigned URL for PUT operation
        upload_url = self.s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': self.bucket_name,
                'Key': s3_key,
                'ContentType': content_type,
            },
            ExpiresIn=expiry_seconds
        )
        
        return {
            'upload_url': upload_url,
            's3_key': s3_key,
            'file_id': file_id,
            'filename': filename,
            'content_type': content_type,
            'bucket': self.bucket_name,
        }
    
    def generate_download_url(
        self, 
        s3_key: str, 
        filename: str,
        expiry_seconds: int = 3600
    ) -> str:
        """
        Generate a presigned URL for downloading a file
        
        Args:
            s3_key: The S3 object key
            filename: Original filename for Content-Disposition
            expiry_seconds: URL expiration time (default 1 hour)
        
        Returns:
            Presigned download URL
        """
        download_url = self.s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': self.bucket_name,
                'Key': s3_key,
                'ResponseContentDisposition': f'attachment; filename="{filename}"',
            },
            ExpiresIn=expiry_seconds
        )
        
        return download_url
    
    def delete_file(self, s3_key: str) -> bool:
        """
        Delete a file from S3/MinIO
        
        Args:
            s3_key: The S3 object key to delete
        
        Returns:
            True if deleted successfully
        """
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            return True
        except Exception as e:
            print(f"Error deleting file {s3_key}: {e}")
            return False
    
    def get_file_metadata(self, s3_key: str) -> Optional[dict]:
        """
        Get metadata for a file from S3/MinIO
        
        Args:
            s3_key: The S3 object key
        
        Returns:
            File metadata dict or None if not found
        """
        try:
            response = self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            return {
                'size': response.get('ContentLength', 0),
                'last_modified': response.get('LastModified'),
                'content_type': response.get('ContentType'),
                'etag': response.get('ETag'),
            }
        except Exception as e:
            print(f"Error getting metadata for {s3_key}: {e}")
            return None


# Global instance
file_upload_service = FileUploadService()
