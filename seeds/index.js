const express = require('express')
const Campground = require('../models/campground');
const {descriptors, places} = require('./seedHelpers')
const mongoose = require('mongoose')
const cities = require('./cities');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then( () => {
        console.log('MnogoDBコネクションOK!!');
    })
    .catch( err => {
        console.log('MongoDBコネクションエラー!!!');
        console.log(err);
    })

const sample = array => array[Math.floor(Math.random() * array.length)]


const seedDB = async () => {
    await Campground.deleteMany({})
    for(let i = 0; i < 50; i++){
        const randomCityIndex = Math.floor(Math.random() * cities.length)
        const price = Math.floor(Math.random() * 2000) + 1000

        const camp = new Campground({
            author: '677e0e1494f70dc551bbfe32',
            location: `${cities[randomCityIndex].prefecture}${cities[randomCityIndex].city}`,
            title: `${sample(descriptors)}・${sample(places)}`,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[randomCityIndex].longitude,
                    cities[randomCityIndex].latitude
                ]
            },
            images: [
                {
                url: 'https://res.cloudinary.com/dogldaqps/image/upload/v1737955435/YelpCamp/sfg6mrlqkw2ht3nm7tjz.jpg',
                filename: 'YelpCamp/sfg6mrlqkw2ht3nm7tjz',
              },
              {
                url: 'https://res.cloudinary.com/dogldaqps/image/upload/v1737955433/YelpCamp/pkgt88kao26t5jyef9ez.jpg',
                filename: 'YelpCamp/pkgt88kao26t5jyef9ez',
              },
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat, quos. Quisquam, quae. Sint, quas. Sunt, voluptate. Quam, quidem. Quisquam, quae. Sint, quas. Sunt, voluptate. Quam, quidem.',
            price: price
        })
        await camp.save()
    }
}

seedDB().then( ()=>{
    mongoose.connection.close();
})