var mongoose = require('mongoose');
var productSchema = new mongoose.Schema({
    image: {type: String, required: true},
    title: {type: String, required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true},
    qty: {type: Number, required: true},
    soldQty: {type: Number, default: 0},
    _tags: {type: Array},
    category: {type: String},
    composition: {type: String},
    mfgDate: {type: String},
    expDate: {type: String},
    brand: {type: String},
    precautions: {type: String}
});

module.exports = mongoose.model("Product", productSchema);