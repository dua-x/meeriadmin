"use client";
import { Plus } from "lucide-react";
import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/custom ui/DataTable";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import axios from "axios";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion } from "framer-motion";

// Types
interface DataWithId {
  _id: string;
  [key: string]: unknown;
}

interface CollectionType {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  typestore?: string;
}

type SizeType = {
  size: string;
  stock: number;
};

type ProductDetailType = {
  color: string;
  sizes: SizeType[];
};

interface Article extends DataWithId {
  name: string;
  images: string[];
  description: string;
  richDescription: string;
  Price: number; // ✅ Changed to number for consistency
  category: CollectionType;
  IsFeatured: boolean;
  productdetail: ProductDetailType[];
  createdAt: string;
  updatedAt: string;
}

// Component
export default function Products() {
  const [products, setProducts] = useState<Article[]>([]);
  const router = useRouter();
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [categories, setCategories] = useState<CollectionType[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_IPHOST ?? ""}/StoreAPI/categories/categoryGET`,
          {
            query: `
              query {
                CategoryGET {
                  _id
                  name
                  description
                  icon
                  typestore
                }
              }
            `,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data?.data?.CategoryGET) {
          setCategories(response.data.data.CategoryGET);
        } else {
          console.error("❌ Unexpected structure", response.data);
          setCategories([]);
        }
      } catch (error) {
        console.error("❌ Failed to fetch categories:", error);
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_IPHOST}/StoreAPI/products/productGET`,
          {
            query: `
              query {
                productGET {
                  _id
                  name
                  description
                  richDescription
                  images
                  Price
                  category {
                    _id   
                    name
                  }
                  IsFeatured
                  productdetail {
                    color
                    sizes {
                      size
                      stock
                    }
                  }
                  createdAt
                  updatedAt
                }
              }
            `,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        setProducts(response.data.data.productGET || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  // Columns for DataTable
  const columns: ColumnDef<Article, unknown>[] = [
    {
      header: "Image",
      accessorFn: (row) => row.images?.[0] ?? "",
      cell: ({ getValue }) => {
        const img = getValue() as string;
        return img ? (
          <Image
            src={img}
            alt="Thumbnail"
            className="object-cover rounded"
            width={50}
            height={50}
          />
        ) : (
          <span className="text-sm text-gray-400">No image</span>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "Price",
      header: "Price",
    },
    {
      header: "Category",
      accessorFn: (row) => row.category?.name || "No Category",
      cell: (info) => info.getValue(),
    },
    {
      header: "Product Details",
      accessorFn: (row) => {
        const details = row.productdetail;
        if (!Array.isArray(details)) return "No details";

        return details
          .map((d) => {
            const sizes = d.sizes
              .map((s: SizeType) => `${s.size} (${s.stock})`)
              .join(", ");
            return `${d.color}: ${sizes}`;
          })
          .join(" | ");
      },
      cell: (info) => info.getValue(),
    },
  ];

  // Delete product
  const handleDeleteProduct = async (id: string, password: string) => {
    try {
      const token = localStorage.getItem("authtoken");

      await axios.post(
        `${process.env.NEXT_PUBLIC_IPHOST}/StoreAPI/products/productPOST`,
        {
          query: `
            mutation DeleteProduct($input: deleteinput!) {
              productDELETE(input: $input) {
                message
              }
            }
          `,
          variables: {
            input: {
              productId: id,
              password: password,
            },
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Product deleted successfully!");
      setProducts((prev) => prev.filter((product) => product._id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete the product. Please try again.");
    }
  };

  // Render product details in dialog
  const renderProductDetails = (product: DataWithId) => {
    if (!product) return <div>No data available</div>;

    const detail = product as Article;

    return (
      <div className="space-y-2 text-sm text-gray-700 p-4">
        <p>
          <strong>Name:</strong> {detail.name}
        </p>
        <p>
          <strong>Description:</strong> {detail.description}
        </p>
        <div>
          <strong>Images:</strong>
          {Array.isArray(detail.images) && detail.images.length > 0 ? (
            <div className="relative w-20 aspect-[3/4] rounded border cursor-pointer overflow-hidden">
              {detail.images.map((img, i) => (
                <Image
                  key={i}
                  src={img}
                  alt={`Product image ${i + 1}`}
                  width={300}
                  height={200}
                  className="w-full h-32 object-cover rounded border cursor-pointer"
                  onClick={() => {
                    setCurrentImage(img);
                    setImageDialogOpen(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <p>No images available</p>
          )}

          <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
            <DialogContent className="max-w-[90vw] md:max-w-2xl">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative"
              >
                {currentImage && (
                  <div className="relative aspect-square w-full max-h-[80vh]">
                    <Image
                      src={currentImage}
                      alt="Product image preview"
                      fill
                      className="object-contain rounded-lg"
                      unoptimized={currentImage.startsWith("blob:")}
                    />
                  </div>
                )}
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
                    Close
                  </Button>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="destructive" onClick={handleImageDelete}>
                      Delete Image
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        </div>

        <p>
          <strong>Price:</strong> ${detail.Price}
        </p>
        <p>
          <strong>Category:</strong> {detail.category?.name || "N/A"}
        </p>
        <p>
          <strong>Created At:</strong> {new Date(detail.createdAt).toLocaleString()}
        </p>
        <p>
          <strong>Updated At:</strong> {new Date(detail.updatedAt).toLocaleString()}
        </p>
        <p>
          <strong>Is Featured:</strong> {detail.IsFeatured ? "Yes" : "No"}
        </p>

        <div>
          <strong>Product Details:</strong>
          {Array.isArray(detail.productdetail) ? (
            <ul className="list-disc list-inside pl-4">
              {detail.productdetail.map((pd, idx) => (
                <li key={idx}>
                  <span className="font-medium">Color:</span> {pd.color} — Sizes:{" "}
                  {pd.sizes
                    .map((s: SizeType) => `${s.size} (${s.stock} in stock)`)
                    .join(", ")}
                </li>
              ))}
            </ul>
          ) : (
            <p>No details</p>
          )}
        </div>
      </div>
    );
  };

  // Handle image delete (stub)
  const handleImageDelete = () => {
    if (!currentImage) return;
    alert(`You can delete image: ${currentImage}`);
    setImageDialogOpen(false);
  };

  // Update product
  const handleUpdateProductAction = async (updatedData: DataWithId, file?: File) => {
    try {
      const token = localStorage.getItem("authtoken");
      const originalProduct = products.find((product) => product._id === updatedData._id);

      if (!originalProduct) {
        alert("Product not found!");
        return;
      }

      const formData = new FormData();
        const excludedFields = new Set([
    '_id',
    'images',
    'icon',
    'createdAt',   // 👈 Exclu ici
    'updatedAt',   // 👈 Exclu ici
    '__v',
  ]);
      // Add all fields except images and icon
      Object.entries(updatedData).forEach(([key, value]) => {
        if (excludedFields.has(key)) return;

        if (key === "productdetail") {
          formData.append(key, JSON.stringify(value));
        } else if (key === "category" && value && typeof value === "object") {
          formData.append(key, (value as CollectionType)._id);
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // Handle images: separate existing URLs and new files
      if (updatedData.images && Array.isArray(updatedData.images)) {
        const imageFiles: File[] = [];
        const existingUrls: string[] = [];

        (updatedData.images as string[]).forEach((img) => {
          if (typeof img === "string") {
            if (img.startsWith("data:image/")) {
              const file = base64ToFile(img, `image-${Date.now()}.png`);
              imageFiles.push(file);
            } else if (img.startsWith("http")) {
              existingUrls.push(img);
            }
          }
        });

        // ✅ Send existing URLs as a JSON string under 'existingImages'
        formData.append("existingImages", JSON.stringify(existingUrls));

        // ✅ Send new image files under 'images' (will be in req.files on backend)
        imageFiles.forEach((file) => {
          formData.append("images", file);
        });
      }

      // Optional icon (if provided)
      if (file) {
        formData.append("icon", file);
      }

      // Send request
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_IPHOST}/StoreAPI/products/editProduct/${updatedData._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        alert("Product updated successfully!");

        // Refresh product list
        const productsResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_IPHOST}/StoreAPI/products/productGET`,
          {
            query: `
              query {
                productGET {
                  _id
                  name
                  description
                  richDescription
                  images
                  Price
                  category {
                    _id
                    name
                  }
                  IsFeatured
                  productdetail {
                    color
                    sizes {
                      size
                      stock
                    }
                  }
                  createdAt
                  updatedAt
                }
              }
            `,
          }
        );

        setProducts(productsResponse.data.data.productGET || []);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update the product. Please try again.");
    }
  };

  // Helper: base64 to File
  const base64ToFile = (base64: string, filename: string): File => {
    const arr = base64.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  };

  // Helper: compare product details (unused but kept)
  const isEqualProductDetail = (a: any, b: any): boolean => {
    if (!Array.isArray(a) || !Array.isArray(b)) return a === b;
    if (a.length !== b.length) return false;

    return a.every((detailA, index) => {
      const detailB = b[index];
      if (detailA.color !== detailB.color) return false;

      if (!Array.isArray(detailA.sizes) || !Array.isArray(detailB.sizes)) {
        return detailA.sizes === detailB.sizes;
      }

      if (detailA.sizes.length !== detailB.sizes.length) return false;

      return detailA.sizes.every((sizeA: any, sizeIndex: number) => {
        const sizeB = detailB.sizes[sizeIndex];
        return sizeA.size === sizeB.size && sizeA.stock === sizeB.stock;
      });
    });
  };

  // Render
  return (
    <div>
      <div className="items-center px-8 py-10 xl:mx-10">
        <div className="flex justify-between">
          <h1 className="lg:text-4xl text-3xl font-bold text-[#857B74] drop-shadow-lg">
            Products
          </h1>
          <Button
            className="btn-primary hover:bg-custom-beige"
            onClick={() => router.push("/products/newproduct")}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Product
          </Button>
        </div>
        <p className="text-sm text-gray-500">{products.length} registered products</p>
      </div>

      <DataTable<Article, unknown>
        columns={columns}
        data={products}
        searchKey="name"
        onDeleteAction={handleDeleteProduct}
        onUpdateAction={handleUpdateProductAction}
        renderDetails={renderProductDetails}
        categories={categories}
        isLoadingCategories={isLoadingCategories}
      />
    </div>
  );
}