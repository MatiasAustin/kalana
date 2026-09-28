"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Image as ImageIcon, Plus, Trash2, Loader2 } from 'lucide-react';
import { createProduct, updateProduct } from '@/lib/actions/products';
import { createMediaRecord } from '@/lib/actions/media';

export function ProductForm({ initialData = null }: { initialData?: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    status: initialData?.status || 'ACTIVE',
  });

  const [variants, setVariants] = useState(
    initialData?.variants || [{ id: 'new-1', name: 'Default', sku: '', price: 0, weight: 0 }]
  );

  const [mediaFiles, setMediaFiles] = useState<{file: File, preview: string}[]>([]);
  const [uploadedMediaIds, setUploadedMediaIds] = useState<string[]>(
    initialData?.media?.map((m: any) => m.mediaId) || []
  );
  
  // To preview existing media
  const [existingMedia, setExistingMedia] = useState<{mediaId: string, url: string}[]>(
    initialData?.media || []
  );

  // Handlers
  const handleAddVariant = () => {
    setVariants([...variants, { id: `new-${Date.now()}`, name: '', sku: '', price: 0, weight: 0 }]);
  };

  const handleVariantChange = (index: number, field: string, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const handleRemoveVariant = (index: number) => {
    const newVariants = [...variants];
    newVariants.splice(index, 1);
    setVariants(newVariants);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setMediaFiles([...mediaFiles, ...newFiles]);
    }
  };

  const removeMediaFile = (index: number) => {
    const newFiles = [...mediaFiles];
    URL.revokeObjectURL(newFiles[index].preview);
    newFiles.splice(index, 1);
    setMediaFiles(newFiles);
  };

  const removeExistingMedia = (mediaId: string) => {
    setExistingMedia(existingMedia.filter(m => m.mediaId !== mediaId));
    setUploadedMediaIds(uploadedMediaIds.filter(id => id !== mediaId));
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      setError("Product Title is required.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    for (const v of variants) {
      if (!v.name || v.price === undefined || v.price === '') {
        setError("All variants must have a name and a price.");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let finalSlug = formData.slug;
      if (!finalSlug) {
        finalSlug = generateSlug(formData.name);
      }

      // 1. Upload new media files to R2 via API
      const newMediaIds = [...uploadedMediaIds];
      
      for (const media of mediaFiles) {
        // Get presigned URL
        const presignedRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: media.file.name,
            contentType: media.file.type,
            size: media.file.size,
            folder: 'products'
          })
        });

        if (!presignedRes.ok) throw new Error('Failed to get upload URL');
        const { url, key, publicUrl } = await presignedRes.json();

        // Upload directly to R2
        const uploadRes = await fetch(url, {
          method: 'PUT',
          body: media.file,
          headers: { 'Content-Type': media.file.type }
        });

        if (!uploadRes.ok) throw new Error('Failed to upload file to R2');

        // Create Media Record in Turso
        const mediaRecord = await createMediaRecord({
          key,
          filename: media.file.name,
          url: publicUrl,
          mimeType: media.file.type,
          size: media.file.size,
          folder: 'products'
        });

        if (mediaRecord.success && mediaRecord.id) {
          newMediaIds.push(mediaRecord.id);
        }
      }

      // 2. Create/Update Product
      const productPayload = {
        name: formData.name,
        slug: finalSlug,
        description: formData.description,
        status: formData.status as any,
        variants: variants.map((v: any) => ({
          id: v.id,
          name: v.name,
          sku: v.sku,
          price: Number(v.price),
          weight: Number(v.weight)
        })),
        mediaIds: newMediaIds
      };

      let result;
      if (initialData?.id) {
        result = await updateProduct(initialData.id, productPayload);
      } else {
        result = await createProduct(productPayload);
      }

      if (result.success) {
        router.push('/admin/products');
        router.refresh();
      } else {
        setError(result.error || 'Failed to save product');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during save.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsSubmitting(false);
    }
  };

  return (
    <form id="product-form" onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{initialData ? 'Edit Product' : 'Add Product'}</h1>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., DAILY HOUSE" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (optional)</label>
              <input 
                type="text" 
                value={formData.slug}
                onChange={e => setFormData({...formData, slug: e.target.value})}
                placeholder="Leave blank to auto-generate" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-gray-50" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                rows={6} 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Product description..." 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              ></textarea>
            </div>
          </div>

          {/* Media */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Media</h2>
            
            <div className="grid grid-cols-4 gap-4">
              {/* Existing Uploaded Media Preview */}
              {existingMedia.map((media, idx) => (
                <div key={`existing-${idx}`} className="relative aspect-square border border-gray-200 rounded-lg overflow-hidden group">
                  <img src={media.url} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => removeExistingMedia(media.mediaId)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}

              {/* New Media Previews */}
              {mediaFiles.map((media, idx) => (
                <div key={idx} className="relative aspect-square border border-gray-200 rounded-lg overflow-hidden group">
                  <img src={media.preview} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => removeMediaFile(idx)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
              
              <label className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center aspect-square hover:bg-gray-50 cursor-pointer transition-colors">
                <ImageIcon className="w-6 h-6 text-gray-400 mb-2" />
                <span className="text-xs font-medium text-gray-600">Add Image</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          </div>

          {/* Variants */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Variants & Pricing</h2>
              <button 
                type="button" 
                onClick={handleAddVariant}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                + Add Variant
              </button>
            </div>
            
            <div className="space-y-4">
              {variants.map((variant: any, idx: number) => (
                <div key={variant.id || idx} className="border border-gray-200 rounded-md p-4 bg-gray-50 space-y-3 relative">
                  {variants.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => handleRemoveVariant(idx)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Variant Name</label>
                      <input 
                        type="text" 
                        value={variant.name}
                        onChange={e => handleVariantChange(idx, 'name', e.target.value)}
                        placeholder="e.g. 200g, 1kg, Red, Blue" 
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">SKU</label>
                      <input 
                        type="text" 
                        value={variant.sku}
                        onChange={e => handleVariantChange(idx, 'sku', e.target.value)}
                        placeholder="e.g. DH-200G" 
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Price (IDR)</label>
                      <input 
                        type="number" 
                        value={variant.price}
                        onChange={e => handleVariantChange(idx, 'price', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Weight (grams)</label>
                      <input 
                        type="number" 
                        value={variant.weight}
                        onChange={e => handleVariantChange(idx, 'weight', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Status</h2>
            <select 
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white"
            >
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 right-0 left-64 bg-white border-t border-gray-200 p-4 px-8 flex justify-end gap-3 z-10 hidden md:flex">
        <Link href="/admin/products" className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
          Discard
        </Link>
        <button 
          type="submit" 
          form="product-form"
          disabled={isSubmitting}
          className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-70 flex items-center"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {initialData ? 'Save Changes' : 'Save Product'}
        </button>
      </div>
    </form>
  );
}
