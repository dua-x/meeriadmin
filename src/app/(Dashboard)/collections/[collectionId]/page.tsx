"use client";
import { useEffect, useState } from "react";
import Loader from "@/components/custom ui/Loader";
import CollectionForm from "@/components/collections/CollectionForm";

const CollectionDetails = ({ params }: { params: { collectionId: string } }) => {
    const [loading, setLoading] = useState(true);
    const [collectionDetails, setCollectionDetails] = useState<CollectionType | null>(null);

    useEffect(() => {
        const fetchCollectionDetails = async () => {
            try {
                const res = await fetch(`/api/collections/${params.collectionId}`, { method: "GET" });
                const data = await res.json();
                setCollectionDetails({
                    ...data,
                    description: data.description || "", // ✅ Provide a default if description is missing
                });
                setLoading(false);
            } catch (err) {
                console.log("[collectionId_GET]", err);
            }
        };

        fetchCollectionDetails();
    }, [params.collectionId]);


    return loading ? <Loader /> : <CollectionForm initialData={collectionDetails} />;
};

export default CollectionDetails;
