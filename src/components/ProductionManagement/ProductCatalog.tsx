import { useEffect } from "react";
import { ChevronsUpDown } from "lucide-react";
import Image from "next/image";
import { Switch } from "../Modals/Settings/ui/Switch";
import Pagination from "../Pagination/Pagination";
import { Product } from "@/types/product";
import { useSelectedOutlet } from "@/hooks/useSelectedOutlet";
import EmptyProduct from "./EmptyProduct";
import { useProductManagementStore } from "@/stores/useProductManagementStore";

const ProductCatalog: React.FC = () => {
  const outlet = useSelectedOutlet();
  const outletId = outlet?.outlet.id;

  const {
    products,
    loading,
    error,
    currentPage,
    totalPages,
    productsPerPage,
    fetchProducts,
    setProductClicked,
    setSelectedProduct,
    updateProductStatus,
    setCurrentPage,
    clearProducts,
    resetError,
  } = useProductManagementStore();

  useEffect(() => {
    if (outletId) {
      fetchProducts(outletId, currentPage, productsPerPage);
    } else {
      clearProducts();
    }
  }, [outletId, currentPage, fetchProducts, clearProducts, productsPerPage]);

  useEffect(() => {
    return () => {
      clearProducts();
    };
  }, [outletId, clearProducts]);

  const handleProductClick = (product: Product) => {
    console.log(product, "Not a random product")
    setProductClicked(true);
    setSelectedProduct(product);
  };

  const toggleAvailability = async (id: number) => {
    const productToToggle = products.find((product) => product.id === id);
    if (!productToToggle || !outletId) return;

    updateProductStatus(id, !productToToggle.isActive);

    try {
      console.log(`Toggling availability for product ${id}`);
    } catch (err) {
      console.error("Error updating product availability:", err);
      updateProductStatus(id, productToToggle.isActive);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    return () => {
      resetError();
    };
  }, [resetError]);

  if (!outletId) return null;

  return (
    <div className="min-h-[70vh] flex flex-col">
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button
            onClick={resetError}
            className="ml-2 text-red-800 underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <div className="w-full">
          <table className="w-full table-fixed bg-[#FAFAFC]">
            <thead className="px-2.5">
              <tr>
                <th className="w-1/3 px-6 py-3 text-left">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product Name
                    </span>
                    <ChevronsUpDown className="w-4 h-4 text-gray-400" />
                  </div>
                </th>
                <th className="w-20 px-6 py-3 text-left">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </span>
                    <ChevronsUpDown className="w-4 h-4 text-gray-400" />
                  </div>
                </th>
                <th className="w-24 px-6 py-3 text-left">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </span>
                    <ChevronsUpDown className="w-4 h-4 text-gray-400" />
                  </div>
                </th>
                <th className="w-40 px-6 py-3 text-left">
                  {products.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Allergens
                      </span>
                      <ChevronsUpDown className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </th>
                <th className="w-28 px-6 py-3 text-left">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Availability
                    </span>
                    <ChevronsUpDown className="w-4 h-4 text-gray-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      <span className="ml-2">Loading products...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    <EmptyProduct />
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    onClick={() => handleProductClick(product)}
                    key={product.id}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <Image
                          className="w-10 h-10 bg-gray-200 rounded-lg"
                          src={product.logoUrl as string}
                          alt={product.name}
                          width={40}
                          height={40}
                        />
                        <div className="flex items-center min-w-0 flex-1">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      £{product.price}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-4 py-1 border border-[#15BA5C] text-sm font-semibold rounded-[10px] bg-[#15BA5C0D] text-[#15BA5C]">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        {product.allergenList?.allergies?.slice(0, 2).map((allergen, index) => (
                          <span
                            key={index}
                            className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded"
                          >
                            {allergen}
                          </span>
                        ))}
                        {product.allergenList?.allergies &&
                          product.allergenList.allergies.length > 2 && (
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs font-bold">
                                +{product.allergenList.allergies.length - 2}
                              </span>
                            </div>
                          )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Switch
                        checked={product.isActive}
                        onChange={() => toggleAvailability(product.id)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && products.length > 0 && (
          <div className="mt-auto pt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCatalog;
