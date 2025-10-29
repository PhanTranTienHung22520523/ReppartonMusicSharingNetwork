"""
File Handler Utility
Manages file uploads, downloads, and cleanup
"""

import os
import uuid
from werkzeug.utils import secure_filename
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class FileHandler:
    """
    Handles file operations for the AI service
    """
    
    def __init__(self, upload_folder: str):
        """
        Initialize file handler
        
        Args:
            upload_folder: Directory for temporary file storage
        """
        self.upload_folder = upload_folder
        self.allowed_extensions = {'mp3', 'wav', 'flac', 'ogg', 'm4a', 'png', 'jpg', 'jpeg', 'pdf'}
        
        # Ensure upload folder exists
        os.makedirs(upload_folder, exist_ok=True)
        
        logger.info(f"FileHandler initialized with upload folder: {upload_folder}")
    
    def allowed_file(self, filename: str) -> bool:
        """
        Check if file extension is allowed
        
        Args:
            filename: Name of the file
            
        Returns:
            True if file extension is allowed
        """
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in self.allowed_extensions
    
    def save_file(self, file) -> str:
        """
        Save uploaded file with unique name
        
        Args:
            file: Werkzeug FileStorage object
            
        Returns:
            Path to saved file
        """
        try:
            # Generate unique filename
            original_filename = secure_filename(file.filename)
            extension = original_filename.rsplit('.', 1)[1].lower()
            unique_filename = f"{uuid.uuid4().hex}.{extension}"
            
            filepath = os.path.join(self.upload_folder, unique_filename)
            
            # Save file
            file.save(filepath)
            
            logger.info(f"File saved: {filepath}")
            
            return filepath
            
        except Exception as e:
            logger.error(f"Error saving file: {str(e)}")
            raise
    
    def delete_file(self, filepath: str) -> bool:
        """
        Delete file from disk
        
        Args:
            filepath: Path to file
            
        Returns:
            True if deleted successfully
        """
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
                logger.info(f"File deleted: {filepath}")
                return True
            else:
                logger.warning(f"File not found: {filepath}")
                return False
                
        except Exception as e:
            logger.error(f"Error deleting file: {str(e)}")
            return False
    
    def get_file_size(self, filepath: str) -> Optional[int]:
        """
        Get file size in bytes
        
        Args:
            filepath: Path to file
            
        Returns:
            File size in bytes or None if file doesn't exist
        """
        try:
            if os.path.exists(filepath):
                return os.path.getsize(filepath)
            else:
                return None
                
        except Exception as e:
            logger.error(f"Error getting file size: {str(e)}")
            return None
    
    def cleanup_old_files(self, max_age_hours: int = 24):
        """
        Clean up old temporary files
        
        Args:
            max_age_hours: Delete files older than this many hours
        """
        try:
            import time
            
            current_time = time.time()
            max_age_seconds = max_age_hours * 3600
            
            deleted_count = 0
            
            for filename in os.listdir(self.upload_folder):
                filepath = os.path.join(self.upload_folder, filename)
                
                if os.path.isfile(filepath):
                    file_age = current_time - os.path.getmtime(filepath)
                    
                    if file_age > max_age_seconds:
                        os.remove(filepath)
                        deleted_count += 1
            
            logger.info(f"Cleanup complete: Deleted {deleted_count} old files")
            
        except Exception as e:
            logger.error(f"Error during cleanup: {str(e)}")
