#!/usr/bin/env python3
"""
Setup script for MinIO bucket
"""

import boto3
from botocore.exceptions import NoCredentialsError, ClientError
import sys

def setup_minio():
    """Setup MinIO bucket and check contents"""
    
    # MinIO configuration
    endpoint_url = "http://localhost:9000"
    access_key = "minioadmin"
    secret_key = "minioadmin"
    bucket_name = "hasamex-expert-profiles"
    region = "us-east-1"
    
    try:
        # Create S3 client for MinIO
        s3_client = boto3.client(
            's3',
            endpoint_url=endpoint_url,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region
        )
        
        print(f"🔗 Connecting to MinIO at {endpoint_url}")
        
        # Check if bucket exists
        try:
            s3_client.head_bucket(Bucket=bucket_name)
            print(f"✅ Bucket '{bucket_name}' exists")
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == '404':
                print(f"📦 Creating bucket '{bucket_name}'...")
                s3_client.create_bucket(Bucket=bucket_name)
                print(f"✅ Bucket '{bucket_name}' created successfully")
            else:
                print(f"❌ Error checking bucket: {e}")
                return False
        
        # List bucket contents
        print(f"\n📋 Listing contents of bucket '{bucket_name}':")
        try:
            response = s3_client.list_objects_v2(Bucket=bucket_name)
            objects = response.get('Contents', [])
            
            if not objects:
                print("📭 Bucket is empty - no PDF files found")
            else:
                print(f"📁 Found {len(objects)} file(s):")
                for obj in objects:
                    size_kb = obj['Size'] / 1024
                    print(f"  - {obj['Key']} ({size_kb:.1f} KB)")
                    
        except ClientError as e:
            print(f"❌ Error listing bucket contents: {e}")
            return False
            
        # Check MinIO console access
        print(f"\n🌐 MinIO Console: http://localhost:9001")
        print(f"🔑 Login: minioadmin / minioadmin")
        
        return True
        
    except NoCredentialsError:
        print("❌ Credentials not available")
        return False
    except Exception as e:
        print(f"❌ Error connecting to MinIO: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Setting up MinIO for Hasamex Expert Database")
    print("=" * 50)
    
    success = setup_minio()
    
    if success:
        print("\n✅ MinIO setup completed successfully!")
        print("\n📝 Next steps:")
        print("1. Start the backend server")
        print("2. Upload PDF files through the expert form")
        print("3. Files will be stored in MinIO bucket")
    else:
        print("\n❌ MinIO setup failed!")
        print("\n🔧 Troubleshooting:")
        print("1. Ensure MinIO is running: docker-compose up minio")
        print("2. Check MinIO is accessible at http://localhost:9000")
        print("3. Verify credentials in config.py")
    
    sys.exit(0 if success else 1)
