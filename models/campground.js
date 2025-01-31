const mongoose = require('mongoose') 
const Review = require('./review')
const {Schema} = mongoose

const ImageSchema = new Schema({
    url: String,
    filename: String
})
ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_200')
})

const opts = { toJSON: { virtuals: true }, toObject: { virtuals: true } };

const campgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts)

campgroundSchema.virtual('properties.title').get(function() {
    return this.title;
});

campgroundSchema.virtual('properties.id').get(function() {
    return this._id;
});

campgroundSchema.virtual('properties.description').get(function() {
    return this.description.substring(0, 20);
});

campgroundSchema.post('findOneAndDelete', async function(doc){
    if(doc){
        await Review.deleteMany({
            _id: {$in: doc.reviews}
        })
    }
})

module.exports = mongoose.model('Campground', campgroundSchema)