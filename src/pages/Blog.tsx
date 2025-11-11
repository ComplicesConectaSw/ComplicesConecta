import { ArrowLeft, Calendar, User } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { useNavigate } from "react-router-dom";
import HeaderNav from "@/components/HeaderNav";

const Blog = () => {
  const navigate = useNavigate();
  const blogPosts = [
    {
      id: 1,
      title: "Gua Completa para Conexiones Seguras en el Lifestyle - v3.5.0",
      excerpt: "Aprende las mejores prcticas para conectar de manera segura y discreta en la comunidad lifestyle. Conoce las nuevas features: Verificador IA de Consentimiento, Galeras NFT-Verificadas, Matching Predictivo con Neo4j y Eventos Virtuales Sostenibles.",
      author: "Equipo ComplicesConecta",
      date: "2025-11-05",
      category: "Seguridad",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop&auto=format&q=80"
    },
    {
      id: 2,
      title: "Cmo Crear un Perfil Atractivo y Autntico",
      excerpt: "Tips y consejos para destacar en la plataforma manteniendo tu autenticidad.",
      author: "Mara Gonzlez",
      date: "2024-11-28",
      category: "Consejos",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=400&fit=crop&auto=format&q=80"
    },
    {
      id: 3,
      title: "Eventos Exclusivos: Qu Esperar y Cmo Participar",
      excerpt: "Todo lo que necesitas saber sobre nuestros eventos presenciales y virtuales.",
      author: "Carlos Ruiz",
      date: "2024-11-25",
      category: "Eventos",
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=400&fit=crop&auto=format&q=80"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600">
      <HeaderNav />
      
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10 py-8">
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/10 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Blog ComplicesConecta
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Consejos, guas y novedades para aprovechar al mximo tu experiencia en la comunidad lifestyle ms exclusiva.
          </p>
        </div>
      </div>

      {/* Blog Posts */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <article key={post.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {post.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-3 line-clamp-2">
                  {post.title}
                </h2>
                
                <p className="text-white/80 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-sm text-white/60 mb-4">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {post.author}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(post.date).toLocaleDateString('es-ES')}
                  </div>
                </div>
                
                <Button 
                  variant="glass" 
                  className="w-full border-white/30 text-white font-semibold hover:bg-white/20 hover:border-white/40 shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => navigate(`/blog/${post.id}`)}
                >
                  Leer ms
                </Button>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter Subscription */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 mt-16 text-center">
          <h3 className="text-2xl font-bold mb-4 text-white">
            Suscrbete a nuestro newsletter
          </h3>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Recibe los ltimos artculos, consejos exclusivos y novedades directamente en tu email.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Tu email"
              className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <Button className="px-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              Suscribirse
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
