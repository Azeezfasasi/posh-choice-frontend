/**
 * Upload file to Cloudinary
 * @param {File} file - The file to upload
 * @param {string} folder - Cloudinary folder path (e.g., 'poshchoice/payment-proofs')
 * @returns {Promise<string>} - Cloudinary URL of the uploaded file
 */
export const uploadToCloudinary = async (file, folder = 'poshchoice/payment-proofs') => {
  if (!file) {
    throw new Error('No file provided for upload');
  }

  // Validate file type (allow images and PDFs)
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload an image (JPEG, PNG, GIF) or PDF.');
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('File size exceeds 5MB limit');
  }

  const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'du1iocgp5';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'poshchoice_upload';

  // Create FormData
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);
  formData.append('resource_type', 'auto'); // Auto-detect: image, video, etc.

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Cloudinary upload failed');
    }

    const data = await response.json();
    return data.secure_url; // Return the secure HTTPS URL
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
};
