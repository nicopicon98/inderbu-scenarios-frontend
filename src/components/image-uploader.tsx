"use client";

import { useState, useEffect } from "react";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Star, Trash, Upload } from "lucide-react";

interface ImageFile {
  file: File;
  isFeature: boolean;
  preview?: string;
}

interface ImageUploaderProps {
  onChange: (files: ImageFile[]) => void;
  maxImages?: number;
  title?: string;
  description?: string;
}

export const ImageUploader = ({
  onChange,
  maxImages = 3,
  title = "Imágenes",
  description = "Puedes subir hasta 3 imágenes. La primera será la imagen destacada por defecto."
}: ImageUploaderProps) => {
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);

  // Generar previsualizaciones cuando cambian los archivos
  useEffect(() => {
    // Limpiar las URL de objeto cuando el componente se desmonte
    return () => {
      imageFiles.forEach((image) => {
        if (image.preview) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const newFiles = Array.from(e.target.files).slice(0, maxImages - imageFiles.length);
    
    if (newFiles.length === 0) return;

    const newImageFiles = newFiles.map((file, index) => {
      const isFirst = imageFiles.length === 0 && index === 0;
      return {
        file,
        isFeature: isFirst, // Solo la primera imagen es destacada por defecto
        preview: URL.createObjectURL(file),
      };
    });

    const updatedImageFiles = [...imageFiles, ...newImageFiles];
    setImageFiles(updatedImageFiles);
    onChange(updatedImageFiles);
  };

  const handleRemoveFile = (index: number) => {
    const updatedImageFiles = [...imageFiles];
    
    // Si eliminamos la imagen destacada y quedan otras, establecer la primera como destacada
    if (updatedImageFiles[index].isFeature && updatedImageFiles.length > 1) {
      // Encontrar el nuevo índice para destacar (el primero que no sea el que eliminamos)
      const newFeatureIndex = index === 0 ? 1 : 0;
      updatedImageFiles[newFeatureIndex].isFeature = true;
    }
    
    // Liberar el objeto URL
    if (updatedImageFiles[index].preview) {
      URL.revokeObjectURL(updatedImageFiles[index].preview!);
    }
    
    updatedImageFiles.splice(index, 1);
    setImageFiles(updatedImageFiles);
    onChange(updatedImageFiles);
  };

  const setAsFeature = (index: number) => {
    const updatedImageFiles = imageFiles.map((file, i) => ({
      ...file,
      isFeature: i === index,
    }));
    
    setImageFiles(updatedImageFiles);
    onChange(updatedImageFiles);
    alert("Imagen establecida como destacada");
  };

  return (
    <Card className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      {/* Contenedor de previsualizaciones */}
      {imageFiles.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          {imageFiles.map((image, index) => (
            <div key={index} className="relative group">
              <div className={`aspect-square rounded overflow-hidden border-2 ${image.isFeature ? 'border-orange-500' : 'border-gray-200'}`}>
                <img
                  src={image.preview}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <Button
                    variant={image.isFeature ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAsFeature(index)}
                    className={`${image.isFeature ? 'bg-orange-500 hover:bg-orange-600' : 'bg-white text-gray-700'}`}
                  >
                    <Star className="h-4 w-4 mr-1" />
                    {image.isFeature ? "Destacada" : "Destacar"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveFile(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {image.isFeature && (
                <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                  Destacada
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Botón de subida */}
      {imageFiles.length < maxImages && (
        <div className="mt-2">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-gray-500" />
              <p className="text-sm text-gray-500">
                <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
              </p>
              <p className="text-xs text-gray-500">SVG, PNG, JPG o GIF (máx. 2MB)</p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              onChange={handleFileChange} 
              accept="image/*"
              multiple={maxImages > 1}
            />
          </label>
        </div>
      )}

      {/* Texto informativo */}
      <div className="mt-2 text-xs text-gray-500">
        {imageFiles.length} de {maxImages} imágenes
      </div>
    </Card>
  );
};
