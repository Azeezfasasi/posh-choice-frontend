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
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type "${file.type}". Please upload an image (JPEG, PNG, GIF) or PDF.`);
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 5MB limit`);
  }

  const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'du1iocgp5';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'unsigned_upload';

  console.log('Cloudinary config:', { cloudinaryCloudName, uploadPreset, folder });

  // Create FormData
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);
  formData.append('resource_type', 'auto');
  formData.append('tags', ['payment-proof', 'poshchoice']);

  try {
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/upload`;
    console.log('Uploading to:', uploadUrl);
    console.log('FormData entries:', {
      file: file.name,
      upload_preset: uploadPreset,
      folder: folder,
    });
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      const errorMsg = data.error?.message || data.message || JSON.stringify(data);
      console.error('Cloudinary error response:', data);
      throw new Error(errorMsg);
    }

    console.log('Cloudinary response success:', {
      secure_url: data.secure_url,
      public_id: data.public_id,
      width: data.width,
      height: data.height,
    });
    
    if (!data.secure_url) {
      throw new Error('No secure URL returned from Cloudinary');
    }
    
    return data.secure_url; // Return the secure HTTPS URL
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    
    // Provide more helpful error messages
    if (error.message.includes('401')) {
      throw new Error('Authentication failed. Check your Cloudinary credentials.');
    }
    if (error.message.includes('403')) {
      throw new Error('Permission denied. The upload preset may not be configured correctly.');
    }
    if (error.message.includes('not found')) {
      throw new Error('Upload preset not found. Please check your Cloudinary account settings.');
    }
    
    throw new Error(`Upload failed: ${error.message}`);
  }
};
