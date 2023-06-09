const mongoose = require("mongoose")

//Who has made the order
const User = require("./UserModel")

const orderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: User,
    },
    orderTotal: {
        itemsCount: { type: Number, required: true }, //N
        cartSubtotal: { type: Number, required: true }
    },
    //Listado de productos que tenemos en la cesta de la compraa
    cartItems: [
        {
            name: { type: String, required: true },
            price: { type: Number, required: true },
            image: { path: { type: String, required: true } },
            quantity: { type: Number, required: true },
            count: { type: Number, required: true }
        }
    ],
    paymentMethod: {
        type: String,
        required: true,
    },

    //Si esta enviado o no el pedido
    transactionResult: {
        status: { type: String }, // Enviado o no 
        createTime: { type: String }, //Cuando se hizo el pedido
        amount: { type: Number } // Precio total del pedido
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false,
    },
    paidAt: {
        type: Date,
    },
    isDelivered: {
        type: Boolean,
        required: true,
        default: false, // Porque cuando se crea un pedido no es enviado inmediatly
    },
    deliveredAt: {
        type: Date,
    }
}, {
    timestamps: true,
})

const Order = mongoose.model("Order", orderSchema)

// Escuchar al evento change
Order.watch().on("change", (data) => {

    if (data.operationType === "insert") {
        io.emit("newOrder", data.fullDocument);
    }
})
module.exports = Order
