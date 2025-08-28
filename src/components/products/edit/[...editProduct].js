import Layout from "@/components/layout";
import { useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import ProductForm from "../ProductForm"

export default function EditProductPage() {
    const [productInfo, setProductInfo] = useState(null);
    const router = useRouter();
    const { id } = router.query;
    useEffect(() => {
        if (!id) {
            return;
        }
        axios.get('categories/Update?id=' + id).then(response => {
            setProductInfo(response.data);
        });
    }, [id]);
    return (
        <Layout>
            <h1>Edit product</h1>
            {productInfo && (
                <ProductForm {...productInfo} />
            )}

        </Layout>
    );
}