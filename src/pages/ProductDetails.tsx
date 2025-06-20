import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowLeft, Clock, Star, Heart } from "lucide-react";
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_active: boolean;
  is_featured: boolean;
  preparation_time: number;
  category_id?: string;
  restaurant_id: string;
  restaurant?: {
    id: string;
    name: string;
    slug: string;
  };
}

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem, getItemCount } = useCart();

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            restaurant:restaurant_id (
              id,
              name,
              slug
            )
          `)
          .eq('id', productId)
          .single();

        if (error) {
          console.error('Error fetching product:', error);
          return;
        }

        setProduct(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      restaurant_id: product.restaurant_id
    });
    
    toast({
      title: "Produto adicionado",
      description: `${product.name} foi adicionado ao carrinho.`,
      duration: 2000,
    });
  };

  const handleGoBack = () => {
    if (product?.restaurant?.slug) {
      navigate(`/restaurante/${product.restaurant.slug}`);
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-primary border-primary/30 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Carregando produto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Produto não encontrado</h1>
          <p className="text-gray-600">O produto que você está procurando não existe ou está inativo.</p>
          <Button onClick={handleGoBack} className="mt-6">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center h-16">
            <button 
              onClick={handleGoBack}
              className="p-2 rounded-full hover:bg-gray-100 mr-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold truncate">{product.name}</h1>
          </div>
        </div>
      </div>

      {/* Product Image */}
      <div className="w-full bg-white">
        {product.image_url ? (
          <div className="relative w-full h-64 md:h-96 overflow-hidden">
            <img 
              src={product.image_url} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-64 md:h-96 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-lg">Sem imagem</span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(product.price)}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <Badge className="bg-primary text-white px-2 py-1">
              <Star className="w-3 h-3 fill-white mr-1" />
              <span>4.8</span>
            </Badge>
            <Badge className="bg-gray-100 text-gray-700 px-2 py-1">
              <Clock className="w-3 h-3 mr-1" />
              <span>{product.preparation_time} min de preparo</span>
            </Badge>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h2 className="text-lg font-semibold mb-3">Descrição</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {product.description || "Sem descrição disponível."}
            </p>
          </div>
        </div>
      </div>

      {/* Floating Add to Cart Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.05)] p-4">
        <div className="max-w-6xl mx-auto">
          <Button 
            className="w-full py-6" 
            size="lg"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Adicionar ao Carrinho
            <span className="ml-2 bg-white text-primary rounded-full h-6 w-6 flex items-center justify-center text-sm font-medium">
              {formatCurrency(product.price)}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails; 