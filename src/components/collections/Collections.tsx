"use client";
import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/custom ui/DataTable";
import { Button } from "@/components/ui/button";
import axios from "axios";

// Define DataWithId manually
interface DataWithId {
    _id: string;
    [key: string]: unknown;
}

// Extend Collection from DataWithId
interface Collection extends DataWithId {
    name: string;
    description: string;
    icon: string;
    typestore: string;
}

const CollectionsPage = () => {
    const [categories, setCategories] = useState<Collection[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.post(`${process.env.NEXT_PUBLIC_IPHOST ?? ""}/StoreAPI/categories/categoryGET`, {
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
                    `
                });
                setCategories(response.data.data.CategoryGET || []);
            } catch (error) {
                console.error('Error fetching categories:', error);
                alert("Failed to fetch categories. Please try again.");
            }
        };

        fetchCategories();
    }, []);

    const handleDeleteCollectionAction = async (id: string) => {
        const token = localStorage.getItem('authtoken');
        if (!token) {
            alert("You need to be logged in to perform this action.");
            return;
        }

        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_IPHOST ?? ""}/StoreAPI/categories/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCategories((prev) => prev.filter((item) => item._id !== id));
            alert("Collection deleted successfully!");
        } catch (error) {
            console.error("Error deleting collection:", error);
            alert("Failed to delete the collection. Please try again.");
        }
    };
    const handleUpdateCollectionAction = async (updatedData: DataWithId) => {
        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_IPHOST ?? ""}/StoreAPI/categories/update/${updatedData._id}`,
                updatedData,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('authtoken')}` },
                }
            );
            if (response.status === 200) {
                setCategories((prev) =>
                    prev.map((item) => (item._id === updatedData._id ? updatedData as Collection : item))
                );
                alert("Collection updated successfully!");
            }
        } catch (error) {
            console.error("Error updating collection:", error);
            alert("Failed to update the collection. Please try again.");
        }
    };

    const columns: ColumnDef<DataWithId, unknown>[] = [
        {
            accessorKey: "icon",
            header: "Icon",
            cell: (info) => {
                const iconValue = info.getValue() as string;
                return iconValue ? (
                    <Image
                        src={iconValue}
                        alt="Category Image"
                        className="object-cover rounded"
                        width={50}
                        height={50}
                        unoptimized
                    />
                ) : (
                    <div className="w-12 h-12 bg-gray-200 flex items-center justify-center text-gray-500">
                        No Image
                    </div>
                );
            },
        },
        {
            accessorKey: "name",
            header: "Name",
        },
        {
            accessorKey: "typestore",
            header: "Store",
        },
    ];


    return (
        <div>
            <div className="flex items-center px-8 py-10 xl:mx-10 justify-between">
                <h1 className="lg:text-4xl text-3xl font-bold text-[#857B74] drop-shadow-lg">
                    Collections
                </h1>

                <Button
                    className="btn-primary hover:bg-custom-beige"
                    onClick={() => router.push("/collections/CreateCollection")}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    new collection
                </Button>
            </div>



            <DataTable<DataWithId, unknown>
                columns={columns as ColumnDef<DataWithId, unknown>[]}
                data={categories}
                searchKey="name"
                editLinkBase="/collections/edit"
                onDeleteAction={handleDeleteCollectionAction}
                onUpdateAction={handleUpdateCollectionAction}

            />


        </div>
    );
};

export default CollectionsPage;
