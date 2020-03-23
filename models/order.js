var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var orderSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    cart: {type: Object, required: true},
    address: {type: String, required: true},
    name: {type: String, required: true},
    paymentId: {type: String},
    paymentMode: {type: String, required: true},
    purchaseDate: { type: Date, default: Date.now },
    isConfirmed: {type: Boolean, default: false},
    isDelivered: {type:Boolean, default: false}
});

module.exports = mongoose.model("Order", orderSchema);