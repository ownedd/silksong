import { usePaginatedQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useEffect, useRef, useState } from "react";

export function PostList() {
  function useDebounce<T>(value: T, delay: number) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
      const handler = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(handler);
    }, [value, delay]);
    return debounced;
  }

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const inputRef = useRef<HTMLInputElement>(null);

  // Hook de paginación
  const {
    results: posts,
    status,
    loadMore,
    isLoading,
  } = usePaginatedQuery(
    api.posts.searchPaginated,
    { q: debouncedSearch }, // 👈 solo pasamos q
    { initialNumItems: 5 } // 👈 aquí defines cuántos cargar al inicio
  );

  // Detectar scroll al final
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 50 && !isLoading) {
      loadMore(5); // carga 5 más
    }
  };

  // if (status === "LoadingFirstPage") {
  //   return (
  //     <div className="flex justify-center items-center py-8">
  //       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6 ">
      <h2 className="text-2xl font-semibold text-white">Mis Entradas</h2>

      <div className="mt-4">
        <label htmlFor="search" className="sr-only">
          Buscar
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título o contenido..."
            className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {status === "LoadingFirstPage" && posts.length === 0 ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-8 text-center">
          {search ? (
            <>
              <h3 className="text-xl font-medium text-gray-300 mb-2">No se encontraron resultados</h3>
              <p className="text-gray-400">Intenta otra búsqueda o borra el filtro.</p>
            </>
          ) : (
            <>
              <h3 className="text-xl font-medium text-gray-300 mb-2">No hay entradas aún</h3>
              <p className="text-gray-400">Crea tu primera entrada usando el formulario de arriba.</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-6 h-[70vh] overflow-y-auto pr-2" onScroll={handleScroll}>
          {posts.map((post) => (
            <article key={post._id} className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden">
              {post.imageUrl && (
                <div className="flex justify-center items-center bg-black/20">
                  <img src={post.imageUrl} alt={post.title} className="max-w-full max-h-[400px] object-contain mx-auto" />
                </div>
              )}

              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-2">{post.title}</h3>

                <div className="text-sm text-gray-400 mb-4">
                  Por {post.authorName} •{" "}
                  {new Date(post._creationTime).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>

                <div className="text-gray-300 whitespace-pre-wrap">{post.content}</div>
              </div>
            </article>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
        </div>
      )}
    </div>
  );
}
