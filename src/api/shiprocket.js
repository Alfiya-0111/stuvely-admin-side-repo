import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const createShipment = async (order) => {
  try {
    const payload = {
      userId: order.userId,
      orderId: order.orderId,
      customer_name: order.customerName,
      address: order.address,
      city: order.city || "Mumbai",
      state: order.state || "Maharashtra",
      pincode: order.pincode || "400001",
      phone: order.phone || "9999999999",
      email: order.email || "demo@mail.com",
      price: order.total,
      payment_method: order.paymentMethod || "COD",
      items: [
        {
          name: "Sample Product",
          sku: "SKU001",
          units: 1,
          selling_price: order.total,
        },
      ],
    };

    const res = await axios.post(`${API_URL}/create-shipment`, payload);
    return res.data;
  } catch (error) {
    console.error("Shipment creation error:", error);
    throw error;
  }
};
