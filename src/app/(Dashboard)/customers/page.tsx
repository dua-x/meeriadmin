"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/custom ui/DataTable";
import { useEffect, useState } from "react";
import axios from "axios";

interface DataWithId {
    _id: string;
    [key: string]: unknown;
}

interface UserType extends DataWithId {
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    postalCode?: string;
    wishlist?: string[];
    orders?: string[];
    createdAt: string;
    updatedAt: string;
    isModerator :boolean;
}

export default function Customers() {
    const [customers, setCustomers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("authtoken");
                if (!token) throw new Error("Authentication token not found");

                const response = await axios.post(
                    process.env.NEXT_PUBLIC_IPHOST + "/StoreAPI/users/userGET",
                    {
                        query: `
                            query {
                                usersGET {
                                    _id
                                    username
                                    email
                                    createdAt
                                    isModerator
                                    adresse
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

                if (response.data?.data?.usersGET) {
                    setCustomers(response.data.data.usersGET);
                } else {
                    throw new Error("Unexpected response structure");
                }
            } catch (error) {
                console.error("Error fetching customers:", error);
                setError("Failed to load customers. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    const columns: ColumnDef<UserType>[] = [
        {
            accessorKey: "username",
            header: "Username",
            cell: (info) => info.getValue() || "N/A",
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: (info) => info.getValue() || "N/A",
        },
                {
            accessorKey: "adresse",
            header: "Adresse",
            cell: (info) => info.getValue() || "N/A",
        },
        {
            accessorKey: "createdAt",
            header: "Join Date",
            cell: (info) => {
                const dateStr = info.getValue() as string;
                return new Date(dateStr).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            },
        },
         {
    accessorKey: "isModerator",
    header: "Moderator",
    cell: (info) => {
        const [isModerator, setIsModerator] = useState(info.getValue() as boolean);
        const row = info.row.original;

        const handleToggle = async () => {
            const newValue = !isModerator;
            setIsModerator(newValue);
            
            try {
                await handleUpdateCustomerAction({
                    ...row,
                    isModerator: newValue
                });
            } catch (error) {
                setIsModerator(!newValue); // Revert if failed
            }
        };

        return (
            <div className="flex items-center">
                <button
                    type="button"
                    onClick={handleToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        isModerator ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isModerator ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                </button>
                <span className={`ml-2 text-xs font-medium ${
                    isModerator ? 'text-blue-800' : 'text-gray-600'
                }`}>
                    {isModerator ? 'Yes' : 'No'}
                </span>
            </div>
        );
    },
}
    ];

    const handleDeleteCustomer = async (id: string) => {
        if (!confirm("Are you sure you want to delete this customer?")) return;

        try {
            const token = localStorage.getItem("authtoken");
            if (!token) throw new Error("Authentication token not found");

            await axios.post(
                `${process.env.NEXT_PUBLIC_IPHOST}/StoreAPI/users/userPOST`,
                {
                    query: `
                        mutation {
                            userDELETE(input: {
                                userId: "${id}"
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

            setCustomers((prev) => prev.filter((customer) => customer._id !== id));
        } catch (error) {
            console.error("Error deleting customer:", error);
            alert("Failed to delete the customer. Please try again.");
        }
    };

    const handleUpdateCustomerAction = async (updatedData: UserType) => {
        try {
            const token = localStorage.getItem("authtoken");
            if (!token) throw new Error("Authentication token not found");

            const originalCustomer = customers.find((c) => c._id === updatedData._id);
            if (!originalCustomer) {
                alert("Customer not found!");
                return;
            }

            const changes: Partial<UserType> = {};
            Object.keys(updatedData).forEach((key) => {
                if (updatedData[key] !== originalCustomer[key]) {
                    changes[key] = updatedData[key];
                }
            });

            if (Object.keys(changes).length === 0) {
                alert("No changes were made.");
                return;
            }

            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_IPHOST}/StoreAPI/users/editUser/${updatedData._id}`,
                changes,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200) {
                setCustomers((prev) =>
                    prev.map((item) =>
                        item._id === updatedData._id ? { ...item, ...changes } : item
                    )
                );
                alert("Customer updated successfully!");
            }
        } catch (error) {
            console.error("Error updating customer:", error);
            alert("Failed to update the customer. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
                <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className="absolute w-24 h-24 border-4 border-[#C4A484] border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute w-16 h-16 border-4 border-[#857B74] border-t-transparent rounded-full animate-spin-slow"></div>
                    <span className="text-[#C4A484] font-bold text-2xl tracking-wide">M</span>
                </div>
                <p className="mt-6 text-[#857B74] text-lg font-semibold tracking-wide">
                    Elevating Your Style at
                    <span className="text-[#C4A484] font-bold"> Merri Store</span>...
                </p>
                <p className="mt-2 text-sm text-gray-500 opacity-80 animate-fade-in">
                    Just a moment, fashion takes time.
                </p>
            </div>
        );
    }

    if (error) return <div className="p-8 text-red-500">{error}</div>;

    return (
        <div className="p-4 md:p-8">
            <div className=" items-center justify-between mb-8">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#857B74] drop-shadow-lg mb-2">
                    Customers
                </h1>
                
                <p className="text-sm text-gray-500">
                    {customers.length} registered customers
                </p>
            </div>
            
            <DataTable<UserType, unknown>
                columns={columns}
                data={customers}
                searchKey="username"
                onDeleteAction={handleDeleteCustomer}
                onUpdateAction={handleUpdateCustomerAction}
                showActions={false}
                allowEdit={false}
            />
        </div>
    );
}