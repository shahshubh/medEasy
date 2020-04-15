var mongoose = require('mongoose');
var productSchema = new mongoose.Schema({
    image: {type: String, required: true},
    title: {type: String, required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true},
    qty: {type: Number, required: true},
    soldQty: {type: Number, default: 0},
    _tags: {type: Array},
    category: {type: String, required: true},
    composition: {type: String, required: true},
    mfgDate: {type: String, required: true},
    expDate: {type: String, required: true},
    brand: {type: String, required: true},
    precautions: {type: String, required: true},
    tablets: {type: String, required: true}
});

module.exports = mongoose.model("Product", productSchema);