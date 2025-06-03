"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/custom ui/DataTable";
import { useEffect, useState } from "react";
import axios from "axios";

interface DataWithId {
    _id: string;
    [key: string]: unknown;
}

export default function Customers() {
    const [customers, setCustomers] = useState<User[]>([]);
   
    useEffect(() => {
        const token = localStorage.getItem("authtoken");
        
        axios.post(process.env.NEXT_PUBLIC_IPHOST + "/StoreAPI/users/userGET", {
            query: `
                query {
                    usersGET {
                        _id
                        username
                        email
                        createdAt
                        isModerator
                    }
                }
            `,
        }, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        })
        .then((response) => {
            if (response.data?.data?.usersGET) {
                setCustomers(response.data.data.usersGET);
            } else {
                console.error("Unexpected response structure");
            }
        })
        .catch((error) => {
            console.error("Error fetching customers:", error);
        });
    }, []);

    // Define the data type
    interface User extends DataWithId {
        username: string;
        email: string;
        createdAt: string;
        updatedAt: string;
    }

    // Define your columns
    const columns: ColumnDef<DataWithId, unknown>[] = [
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
            accessorKey: "createdAt",
            header: "Join Date",
            cell: (info) => {
                const dateStr = info.getValue() as string;
                const date = new Date(dateStr);
                return date.toLocaleDateString('en-US', {
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
            const isModerator = info.getValue() as boolean;
            return (
                <span className={`px-2 py-1 rounded-full text-xs ${
                    isModerator 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                }`}>
                    {isModerator ? "Yes" : "No"}
                </span>
            );
        },
    },
    ];

    const handleDeleteCustomer = async (id: string) => {
        try {
            const token = localStorage.getItem("authtoken");

            await axios.post(
                `${process.env.NEXT_PUBLIC_IPHOST}/StoreAPI/users/userPOST`,
                {
                    query: `
                        mutation {
                            userDELETE(input: {
                                userId: "${id}"
                                password: "younes@"
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

            alert("Customer deleted successfully!");
            setCustomers((prev) => prev.filter((customer) => customer._id !== id));
        } catch (error) {
            console.error("Error deleting customer:", error);
            alert("Failed to delete the customer. Please try again.");
        }
    };

    const handleUpdateCustomerAction = async (updatedData: DataWithId) => {
        try {
            const token = localStorage.getItem("authtoken");

            // Find the original customer from the state
            const originalCustomer = customers.find((customer) => customer._id === updatedData._id);
            if (!originalCustomer) {
                alert("Customer not found!");
                return;
            }

            // Create an object to hold only the changed fields
            const changes: Partial<DataWithId> = {};

            // Compare each field and add to `changes` if it's different
            Object.keys(updatedData).forEach((key) => {
                if (updatedData[key] !== originalCustomer[key]) {
                    changes[key] = updatedData[key];
                }
            });

            // If no changes were made, exit early
            if (Object.keys(changes).length === 0) {
                alert("No changes were made.");
                return;
            }

            // Send the PUT request with only the changed fields
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_IPHOST}/StoreAPI/users/Update/${updatedData._id}`,
                changes,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200) {
                // Update the local state with the updated customer
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

    return (
        <div>
            <div className="flex items-center px-8 py-10 xl:mx-10 justify-between">
                <h1 className="lg:text-4xl text-3xl font-bold text-[#857B74] drop-shadow-lg">
                    Customers
                </h1>
            </div>
            <DataTable<DataWithId, unknown>
                columns={columns as ColumnDef<DataWithId, unknown>[]}
                data={customers}
                searchKey="username"
                editLinkBase="/customers/edit"
                onDeleteAction={handleDeleteCustomer}
                onUpdateAction={handleUpdateCustomerAction}
                showActions={false}
            />
        </div>
    );
}