import { useState, useRef, FormEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";

export function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const imageInput = useRef<HTMLInputElement>(null);
  const createPost = useMutation(api.posts.create);
  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast.error("El título y contenido son obligatorios");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageId = undefined;

      if (selectedImage) {
        // Subir imagen
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": selectedImage.type },
          body: selectedImage,
        });
        
        if (!result.ok) {
          throw new Error("Error al subir la imagen");
        }
        
        const json = await result.json();
        imageId = json.storageId;
      }

      // Crear la entrada
      await createPost({
        title: title.trim(),
        content: content.trim(),
        imageId,
      });

      // Limpiar formulario
      setTitle("");
      setContent("");
      setSelectedImage(null);
      if (imageInput.current) {
        imageInput.current.value = "";
      }

      toast.success("Entrada creada exitosamente");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al crear la entrada");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
      <h2 className="text-2xl font-semibold mb-6 text-white">Crear Nueva Entrada</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
            Título
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            placeholder="Escribe el título de tu entrada..."
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
            Contenido
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical placeholder-gray-400"
            placeholder="Escribe el contenido de tu entrada..."
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-300 mb-2">
            Imagen (opcional)
          </label>
          <input
            id="image"
            ref={imageInput}
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
            className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          />
          {selectedImage && (
            <p className="mt-2 text-sm text-gray-400">
              Imagen seleccionada: {selectedImage.name}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !title.trim() || !content.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Creando..." : "Crear Entrada"}
        </button>
      </form>
    </div>
  );
}
