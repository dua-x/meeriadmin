type CollectionType = {
    _id: string;
    name: string;
    description: string; // ✅ Added this field
    icon: string;
    color: string;
    typestore: string;
    createdAt: string;
    updatedAt: string;
};


type ProductDetailType = {
    color: string;
    sizes: {
        size: number;
        stock: number;
    }[];
};

type ProductType = {
    _id: string;
    name: string;
    description: string;
    richDescription: string;
    images: string[];
    brand: string;
    Price: string;         // Consider renaming to "price" for consistency
    category: string;
    CountINStock: number;  // Consider renaming to "countInStock"
    rating: number;
    createdAt: string;
    updatedAt: string;
    IsFeatured: boolean;   // Consider renaming to "isFeatured"
    productdetail: ProductDetailType[];
};

type UserType = {
    id: string
    username: string
    email?: string
    wishlist?: string[]
    createdAt: string
    updatedAt: string
  }
  

type OrderItem = {
    product: ProductType[];
    quantity: number;
    color: string;
    size: string;
    _id: string;
};
type OrderStatus = "en cours de confirmation" | "confirmé" | "en livraison" | "livré" | "annulé";

type OrderType = {
    _id: string;
    firstname?: string;
    lastname?: string;
    orderitems: OrderItem[];  // Changed from tuple [OrderItem] to an array of OrderItem
    adress: string;           // Changed from "String" to "string"
    city: string;             // Changed from "String" to "string"
    postalcode: string;       // Changed from "String" to "string"
    phonenumber: string;      // Changed from "String" to "string"
   status: OrderStatus;
    totalprice: number;       // Changed from "Number" to "number"
    quantityOrder: number;    // Changed from "Number" to "number"
    user: UserType;           // Changed from User to UserType
    dateordered: string;      // Removed the exclamation mark and changed from "String" to "string"
    createdAt: string;        // Changed from "String" to "string"
    updatedAt: string;        // Changed from "String" to "string"
};
