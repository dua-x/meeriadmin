"use client";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";
import { Separator } from "../ui/separator";
import { Card, Button } from "flowbite-react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/actions/cropImage";
import { Area } from "react-easy-crop";



type CollectionType = {
    _id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    typestore: string;
    createdAt: string;
    updatedAt: string;
};

interface CollectionFormProps {
    initialData?: CollectionType | null;
}

const formSchema = z.object({
    name: z.string().min(2).max(20),
    description: z.string().min(2).max(500).trim(),
    icon: z.array(z.string()),
    typestore: z.string().min(1, "Please select a type"),
});

const CollectionForm: React.FC<CollectionFormProps> = ({ initialData }) => {
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<File[]>([]);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || "",
            description: initialData?.description || "",
            icon: initialData?.icon ? [initialData.icon] : [],
            typestore: initialData?.typestore || "",
        },
    });

    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setImages([file]);

            const reader = new FileReader();
            reader.onload = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            form.setValue("icon", [file.name]);
        }
    };
    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);
    const handleSubmit = async (data: z.infer<typeof formSchema>) => {
        setLoading(true);
        const formData = new FormData();

        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("typestore", data.typestore);

        if (images.length > 0 && croppedAreaPixels) {
            try {
                const croppedImage = await getCroppedImg(imagePreview as string, croppedAreaPixels);
                formData.append("icon", croppedImage);
            } catch (error) {
                console.error("Error cropping image:", error);
                toast.error("Failed to process image.");
                setLoading(false);
                return;
            }
        }

        try {
            const token = localStorage.getItem("authtoken");
            await axios.post(
                process.env.NEXT_PUBLIC_IPHOST + "/StoreAPI/categories/CreateCategory",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success("Category created successfully!");
            router.back();
        } catch (error) {
            toast.error("Failed to create category.");
            console.error("Error creating category:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="bg-white m-8 rounded-lg shadow-lg max-w-lg w-full max-w-3xl bg-transparent relative">
            <div className="p-6 justify-center items-center">
                <h1 className="text-3xl font-bold text-center text-[#857B74] drop-shadow-lg">
                    Create Collection
                </h1>

                <Separator className="bg-grey-1" />
                <Form {...form}>
                    <form className="space-y-8" onSubmit={form.handleSubmit(handleSubmit)}>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Collection Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="icon"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Icon</FormLabel>
                                    <FormControl>
                                        <Input type="file" accept="image/*" onChange={handleFileChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {imagePreview && (
                            <div className="relative w-full h-64">
                                <Cropper
                                    image={imagePreview}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={3 / 4}
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onCropComplete={onCropComplete}
                                />
                            </div>
                        )}
                        <FormField
                            control={form.control}
                            name="typestore"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Store Type</FormLabel>
                                    <FormControl>
                                        <select {...field} className="border p-2 w-full rounded">
                                            <option value="">Select Type</option>
                                            <option value="accessoire">Accessoires store</option>
                                            <option value="vetement">Vetements store</option>
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Description" {...field} rows={5} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex gap-10">
                            <Button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? "Creating..." : "Submit"}
                            </Button>
                            <Button type="button" className="bg-blue-1 text-white">
                                Discard
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </Card>
    );
};

export default CollectionForm;
