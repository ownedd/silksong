import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function PostList() {
  const posts = useQuery(api.posts.list);

  if (posts === undefined) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-8 text-center">
        <h3 className="text-xl font-medium text-gray-300 mb-2">No hay entradas aún</h3>
        <p className="text-gray-400">Crea tu primera entrada usando el formulario de arriba.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white">Mis Entradas</h2>
      
      <div className="space-y-6">
        {posts.map((post) => (
          <article key={post._id} className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden">
            {post.imageUrl && (
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-2">
                {post.title}
              </h3>
              
              <div className="text-sm text-gray-400 mb-4">
                Por {post.authorName} • {new Date(post._creationTime).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              
              <div className="text-gray-300 whitespace-pre-wrap">
                {post.content}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
