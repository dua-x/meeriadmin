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



interface DataWithId {
    _id: string;
    [key: string]: unknown;
}

export default function Products() {
const [products, setProducts] = useState<Article[]>([]);
const router = useRouter();
const [imageDialogOpen, setImageDialogOpen] = useState(false);
const [currentImage, setCurrentImage] = useState<string | null>(null);
const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);

const handleImageDelete = () => {
  if (!currentImage) return;
  alert(`You can delete image: ${currentImage}`);
  setImageDialogOpen(false);
};

    useEffect(() => {
  axios
    .post(process.env.NEXT_PUBLIC_IPHOST + "/StoreAPI/categories/categoryGET", {
      query: `
        query {
          categoryGET {
            _id
            name
          }
        }
      `,
    })
    .then((response) => {
      setCategories(response.data.data.categoryGET);
    })
    .catch((error) => {
      console.error("Error fetching categories:", error);
    });
}, []);

    useEffect(() => {
        axios
            .post(process.env.NEXT_PUBLIC_IPHOST + "/StoreAPI/products/productGET", {
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
                                name
                            }
                            createdAt
                            updatedAt
                            IsFeatured
                            productdetail{
                                color
                                sizes{
                                    size
                                    stock
                                }
                            }
                        }
                    }
                `,
            })
            .then((response) => {
                setProducts(response.data.data.productGET);
            })
            .catch((error) => {
                console.error("Error fetching products:", error);
            });
    }, []);

    // Define the data type
interface Article extends DataWithId {
    name: string;
    description: string;
    richDescription: string;
    images: string[];
    Price: string;
    category: {
        name: string;
    };
    createdAt: string;
    updatedAt: string;
    IsFeatured: boolean;
    productdetail: {
        color: string;
        sizes: {
            size: number;
            stock: number;
        }[];
    };
}


    // Define your columns
const columns: ColumnDef<DataWithId, unknown>[] = [
  {
  header: "Image",
  accessorFn: (row) => (row as Article).images?.[0] ?? "",
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
    accessorFn: (row) => (row as any).category?.name || "No Category",
    cell: (info) => info.getValue(),
  },
  {
    header: "Product Details",
    accessorFn: (row) => {
      const details = (row as any).productdetail;
      if (!Array.isArray(details)) return "No details";

      return details
        .map((d: any) => {
            const sizes = d.sizes.map((s: SizeType) => `${s.size} (${s.stock})`).join(", ");
          return `${d.color}: ${sizes}`;
        })
        .join(" | ");
    },
    cell: (info) => info.getValue(),
  },
];

    const handleDeleteProduct = async (id: string) => {
        try {
            const token = localStorage.getItem("authtoken");

            await axios.post(
                `${process.env.NEXT_PUBLIC_IPHOST}/StoreAPI/products/productPOST`,
                {
                    query: `
                        mutation {
                            productDELETE(input: {
                                productId: "${id}"
                                password: "${id}"
                            }) {
                                message
                            }
                        }
                    `,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            alert("Product deleted successfully!");
            // Optionally, refresh the products list
            setProducts((prev) => prev.filter((product) => product._id !== id));
        } catch (error) {
            console.error("Error deleting product:", error);
            alert("Failed to delete the product. Please try again.");
        }
    };
    const renderProductDetails = (product: DataWithId) => {
        if (!product) return <div>No data available</div>;

        const detail = product as Article;

        return (
            <div className="space-y-2 text-sm text-gray-700 p-4">
            <p><strong>Name:</strong> {detail.name}</p>
            <p><strong>Description:</strong> {detail.description}</p>
            <div>
                <strong>Images:</strong>
                {Array.isArray(detail.images) && detail.images.length > 0 ? (
                     <div className="relative relative w-20 aspect-[3/4] rounded border cursor-pointer overflow-hidden">
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

                {/* Image Preview Dialog */}
                <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
                    <DialogContent className="max-w-[90vw] md:max-w-2xl">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
                        {currentImage && (
                        <div className="relative aspect-square w-full max-h-[80vh]">
                            <Image
                            src={currentImage}
                            alt="Enlarged preview"
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

            <p><strong>Price:</strong> {detail.Price}</p>
            <p><strong>Category:</strong> {detail.category?.name || "N/A"}</p>
            <p><strong>Created At:</strong> {new Date(detail.createdAt).toLocaleString()}</p>
            <p><strong>Updated At:</strong> {new Date(detail.updatedAt).toLocaleString()}</p>
            <p><strong>Is Featured:</strong> {detail.IsFeatured ? "Yes" : "No"}</p>

            <div>
                <strong>Product Details:</strong>
                {Array.isArray(detail.productdetail) ? (
                <ul className="list-disc list-inside pl-4">
                    {detail.productdetail.map((pd, idx) => (
                    <li key={idx}>
                        <span className="font-medium">Color:</span> {pd.color} —
                        Sizes:{" "}
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

const handleUpdateProductAction = async (updatedData: DataWithId) => {
    try {
        const token = localStorage.getItem("authtoken");

        const originalProduct = products.find((product) => product._id === updatedData._id);
        if (!originalProduct) {
            alert("Product not found!");
            return;
        }

        const changes: Partial<DataWithId> = {};
        Object.keys(updatedData).forEach((key) => {
            if (updatedData[key] !== originalProduct[key]) {
                changes[key] = updatedData[key];
            }
        });

        if (Object.keys(changes).length === 0) {
            alert("No changes were made.");
            return;
        }

        const query = `
            mutation UpdateProduct($input: ProductUpdateInput!) {
                productUpdate(input: $input) {
                    product {
                        _id
                        name
                        category {
                                name
                            }
                        Price
                        CountINStock
                    }
                    message
                }
            }
        `;

        const variables = {
            input: {
                _id: updatedData._id,
                updates: changes,
            },
        };

        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_IPHOST}/StoreAPI/products/productPOST`,
            {
                query,
                variables,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const result = response.data.data.productUpdate;
        if (result.product) {
            setProducts((prev) =>
                prev.map((item) =>
                    item._id === updatedData._id ? { ...item, ...changes } : item
                )
            );
            alert(result.message || "Product updated successfully!");
        } else {
            alert(result.message || "Update failed.");
        }

    } catch (error) {
        console.error("Error updating product:", error);
        alert("Failed to update the product. Please try again.");
    }
};


    return (
        <div>
               <div className=" items-center px-8 py-10 xl:mx-10">
                <div className="flex  justify-between">
                <h1 className="lg:text-4xl text-3xl font-bold text-[#857B74] drop-shadow-lg">
                    Products
                </h1>

             <Button
                    className="btn-primary hover:bg-custom-beige"
                    onClick={() => router.push("/products/newproduct")}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    new product
                </Button>
            </div>
              <p className="text-sm text-gray-500">
                    {products.length} registered products
                </p>
                </div>
           <DataTable<DataWithId, unknown>
                columns={columns}
                data={products}
                searchKey="name"
                onDeleteAction={handleDeleteProduct}
                onUpdateAction={handleUpdateProductAction}
                renderDetails={renderProductDetails}
                categories={categories} // ✅ pass this down
                />

        </div>
    );
}

