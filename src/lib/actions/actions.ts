import axios from 'axios';



export const getTotalCustomers = async () => {
    try{
    const token = localStorage.getItem('authtoken'); // Retrieve token from local storage

    const response = await axios.get(process.env.NEXT_PUBLIC_IPHOST+'/StoreAPI/users/countusers',{
        headers: {
            'Content-Type': 'multipart/form-data',  // Use 'multipart/form-data' for FormData
            Authorization: `Bearer ${token}`,
        },
    })
    return response.data.count;
}catch(error){
    return 0;
}
}
export const getTotalorders = async ()=>{
    try{
        const token = localStorage.getItem('authtoken'); // Retrieve token from local storage
    
        const response = await axios.get(process.env.NEXT_PUBLIC_IPHOST+'/StoreAPI/orders/countorders',{
            headers: {
                'Content-Type': 'multipart/form-data',  // Use 'multipart/form-data' for FormData
                Authorization: `Bearer ${token}`,
            },
        })
        return response.data.count;
    }catch(error){
        return 0;
    }
}

export const handlelog = async () => {
    try {
        const token = localStorage.getItem('authtoken'); // Retrieve token from local storage

        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_IPHOST}/StoreAPI/users/userGET`,
            {
                query: `
                    query {
                            userGETById {
                                
                                username
                                email
                            }
                            }
                                            `,
            },
            {
                headers: {
                    'Content-Type': 'application/json', // Use 'application/json' for GraphQL queries
                    Authorization: `Bearer ${token}`, // Add token in the Authorization header
                },
            }
        );

        if (!response.data) {
            throw new Error("Failed to fetch user informations");
        }

        const user = response.data.data.userGETById; // Adjust this based on API response structure
        return user;
    } catch (error) {
        console.error("Error fetching user informations :", error);
        return error;
    }
}
export const handleDeleteOrder = async (id: string, password: string) => {
  try {
    const token = localStorage.getItem("authtoken");

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_IPHOST}/StoreAPI/orders/orderPOST`, 
      {
        query: `
          mutation {
            orderDELETE(input: {
              _id: "${id}"
              password: "${password}"
            }) {
              message
            }
          }
        `
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // ⚡ Récupération de la réponse GraphQL
    const message = response.data.data.orderDELETE.message;

    alert(message);

  } catch (error: any) {
    console.error("Error deleting order:", error);
    alert("Failed to delete the order. Please try again.");
  }
};
